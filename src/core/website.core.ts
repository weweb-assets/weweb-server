import { Response } from 'express'
import { s3 } from '../services'
import { db } from '.'
import { Op } from 'sequelize'
import axios from 'axios'
const fs = require('fs-extra')
const mime = require('mime-types')



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
    public async redirectTo404(res: Response, designVersionId: string) {
        const url = await this.get404Url(designVersionId)
        return url ? res.status(404).redirect(url) : res.status(404).send()
    }

    /**
     * Get page 404
     * @memberof Server
     */
    public async get404Url(designVersionId: string) {
        const page = await db.models.page.findOne({
            where: {
                designVersionId,
                paths: { [Op.contains]: { default: '404' } },
            },
        })
        return page ? '/404' : null
    }

    /**
     * Get file from S3 or file storage
     * @memberof Server
     */
    public async getFile(key: string) {
        //From S3
        if(s3.isConnected()){
            const file = await s3.getSignedFileFromS3Websites(key)
            file.data = file.Body
            return file
        }
        //From local storage
        else if(key.startsWith('/') || key.startsWith('./')) {
            const file = fs.readFileSync(key)
            return {
                data: file,
                'ContentType': mime.lookup(key),
                'ContentLength': file.length,
                ETag: '',
                'LastModified': '',
                'AcceptRanges': '',
            }
        }
        //From external storage
        else {
            try {
                const file = await axios.get(key, { responseType: 'arraybuffer' })
                return {
                    data: file.data,
                    'ContentType': file.headers['content-type'],
                    'ContentLength': file.headers['content-length'],
                    ETag: file.headers['etag'],
                    'LastModified': file.headers['last-modified'],
                    'AcceptRanges': file.headers['accept-ranges'],
                }
            } catch (error) {
                console.log(error)
            }
            
        }
    }
}
