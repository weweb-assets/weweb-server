import { Response } from 'express'
import { log, s3 } from '../services'
import { db } from '.'
import { Op } from 'sequelize'
import axios from 'axios'
const fs = require('fs-extra')
const mime = require('mime-types')
const wwmt = require('weweb-microservice-token')
const { JSDOM } = require('jsdom')

/**
 * Website core.
 * @export
 * @class Website
 */
export default class Website {
    /**
     * Redirect to page 404
     * @memberof Server
     */
    public async redirectTo404(res: Response) {
        return res.set({ 'cache-control': 'no-cache' }).status(404).send()
    }

    /**
     * Get 404 page
     * @memberof Server
     */
    public async get404Page(designVersion: any) {
        const page = await db.models.page.findOne({
            where: {
                designVersionId: designVersion.id,
                paths: { [Op.contains]: { default: '404' } },
            },
        })

        return page
    }

    /**
     * Transform variables into file path
     * @memberof Server
     */
    public getCachePath(designId: string, designVersionId: string, cacheVersion: string) {
        if (process.env.FILES_PATH) {
            return process.env.FILES_PATH.replace(':projectId', designId).replace(':filesVersion', cacheVersion)
        } else {
            return `designs/${designId}/cache/${designVersionId}/${cacheVersion}`
        }
    }

    /**
     * Get file from S3 or file storage
     * @memberof Server
     */
    public async getFile(key: string) {

        if (key.indexOf('../') !== -1 || key.indexOf('/./') !== -1) throw new Error('../ and /./ are not allowed in key')

        //From S3
        if (s3.isConnected()) {
            const file = await s3.getSignedFileFromS3Websites(key)
            file.data = file.Body
            return file
        }
        //From local storage
        else if (process.env.FILES_PATH.startsWith('./')) {
            const file = fs.readFileSync(key)
            return {
                data: file,
                ContentType: mime.lookup(key),
                ContentLength: file.length,
                ETag: '',
                LastModified: '',
                AcceptRanges: '',
            }
        }
        //From external storage
        else {
            const file = await axios.get(key, { responseType: 'arraybuffer' })
            return {
                data: file.data,
                ContentType: file.headers['content-type'],
                ContentLength: file.headers['content-length'],
                ETag: file.headers['etag'],
                LastModified: file.headers['last-modified'],
                AcceptRanges: file.headers['accept-ranges'],
            }
        }
    }
    /**
     * Get file from S3 through Cloudfront
     * @memberof Server
     */
    public async getFileWithCloudfront(encoding: string, key: string) {
        const file = await axios.get(`${process.env.CDN_WEBSITES_URL}/${key}`, {
            responseType: 'arraybuffer',
            headers: {
                'accept-encoding': encoding || '',
            },
        })
        return {
            data: file.data,
            ContentEncoding: file.headers['content-encoding'],
            ContentType: file.headers['content-type'],
            ContentLength: file.headers['content-length'],
            ETag: file.headers['etag'],
            LastModified: file.headers['last-modified'],
            AcceptRanges: file.headers['accept-ranges'],
        }
    }


    /**
     * Get file from S3 or file storage
     * @memberof Server
     */
    public async streamFile(key: string) {
        //From S3
        if (s3.isConnected()) {
            return s3.streamFileFromS3Websites(key)
        }
        //From local storage
        else if (key.startsWith('/') || key.startsWith('./')) {
            return fs.createReadStream(key)
        }
        //From external storage
        else {
            const response = await axios.get(key, { responseType: 'stream' })
            return response.data
        }
    }

    public async cleanBackups(designId: String) {
        if (!process.env.WEWEB_BACK_URL) return

        const { body: design } = await wwmt.get(`${process.env.WEWEB_BACK_URL}/v1/microservice/designs/${designId}`)
        const features = { ...design.features, ...design.customFeatures }
        const backups = features.backups || 5

        const designVersionsToDelete = await db.models.designVersion.findAll({
            where: {
                designId,
            },
            order: [['createdAt', 'DESC']],
        })

        let i = 0
        for (const designVersion of designVersionsToDelete) {
            if (designVersion.activeCheckpoint) continue
            if (designVersion.activeBackup) ++i
            if (i <= backups) continue
            if (designVersion.activeProd || designVersion.activeStaging) continue
            await designVersion.destroy()
        }
    }

    /**
     * Test file storage
     */
    public async testFiles() {
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.BUCKETREGION) {
            log.info(`Using S3 as file Storage : FILES_PATH=${process.env.FILES_PATH}`)
            return { storage: 'S3', connected: await s3.testConnection() }
        } else {
            if (!process.env.FILES_PATH) {
                log.error(`Missing FILES_PATH environment variable`)
                return { storage: 'NONE', connected: false }
            } else if (process.env.FILES_PATH.startsWith('./') || process.env.FILES_PATH.startsWith('/')) {
                log.info(`Using local file Storage : FILES_PATH=${process.env.FILES_PATH}`)
                return { storage: 'LOCAL', connected: true }
            } else {
                log.info(`Using distant file Storage : FILES_PATH=${process.env.FILES_PATH}`)
                return { storage: 'DISTANT', connected: true }
            }
        }
    }
}
