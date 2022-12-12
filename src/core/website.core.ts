import { Response } from 'express'
import { log, s3 } from '../services'
import { db } from '.'
import { Op } from 'sequelize'
import axios from 'axios'
const fs = require('fs-extra')
const mime = require('mime-types')
const wwmt = require('weweb-microservice-token')

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
    public async redirectTo404(res: Response, designVersion: any, lang: string) {
        const url = await this.get404Url(designVersion, lang)
        return url ? res.set({ 'cache-control': 'no-cache' }).status(404).redirect(url) : res.set({ 'cache-control': 'no-cache' }).status(404).send()
    }

    /**
     * Get page 404
     * @memberof Server
     */
    public async get404Url(designVersion: any, lang: string) {
        const page = await db.models.page.findOne({
            where: {
                designVersionId: designVersion.id,
                paths: { [Op.contains]: { default: '404' } },
            },
        })

        let langPath = ''

        //Lang in request path
        if (lang) {
            const langConfig = designVersion.langs.find((langConfig: any) => langConfig.lang === lang)

            //Lang not found
            if (!langConfig) lang = null
            //Lang found & is default lang
            else if (langConfig.default) {
                //Use lang slug
                if (langConfig.isDefaultPath) langPath = `/${langConfig.lang}`
                //Do not use lang slug
                else langPath = ''
            }
            //Lang found & is not default
            else langPath = `/${langConfig.lang}`
        }

        //No lang in request path
        if (!lang) {
            const defaultLangConfig = designVersion.langs.find((langConfig: any) => langConfig.default)

            //Default lang config use slug
            if (defaultLangConfig.isDefaultPath) langPath = `/${defaultLangConfig.lang}`
            //Default lang config do not use slug
            else langPath = ''
        }

        return page ? `${langPath}/404` : null
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
        //From S3
        if (s3.isConnected()) {
            const file = await s3.getSignedFileFromS3Websites(key)
            file.data = file.Body
            return file
        }
        //From local storage
        else if (key.startsWith('/') || key.startsWith('./')) {
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

        const backups = design.pricingPlan.features.backups || 5

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
