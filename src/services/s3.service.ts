import { log } from '../services'
const aws = require('aws-sdk')

/**
 * S3 service.
 * @export
 * @class Utils
 */
export default class S3 {
    s3: any
    constructor() {
        //If env variables are not set
        //We are in self host without S3 (maybe not on AWS)
        //Then set S3 to null
        if(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.BUCKETREGION){
            this.s3 = new aws.S3({
                apiVersion: '2006-03-01',
                signatureVersion: 'v4',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.BUCKETREGION,
            })
        }
        else this.s3 = null
        
    }

    public async testConnection(){
        try {
            const testKey = 'ww_test_key/test.txt'

            await new Promise((resolve, reject) => {
                const params = {
                    Body: 'TEST OBJECT', 
                    Bucket: process.env.BUCKETNAME, 
                    Key: testKey
                };
                this.s3.putObject(params, function(err: any, data: any) {
                    if (err) reject(err);
                    else     resolve(data); 
                })
            })

            await new Promise((resolve, reject) => {
                const params = {
                    Bucket: process.env.BUCKETNAME, 
                    Key: testKey
                };
                this.s3.getObject(params, function(err: any, data: any) {
                    if (err) reject(err);
                    else     resolve(data); 
                })
            })

            await new Promise((resolve, reject) => {
                const params = {
                    Bucket: process.env.BUCKETNAME, 
                    Key: testKey
                };
                this.s3.deleteObject(params, function(err: any, data: any) {
                    if (err) reject(err);
                    else     resolve(data); 
                })
            })

            log.info('S3 Configuration is ok')
            return true
        } catch (error) {
            log.error('S3 Configuration error')
            log.error(error)
            return false
        }
    }

    public isConnected(): Boolean{
        if(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.BUCKETREGION){
            return true
        }
        else return false
    }


    public async getSignedFileFromS3Websites(key: string): Promise<any> {
        log.debug('services:s3:getSignedFileFromS3Websites', key)

        if (process.env.BUCKETURL && key.indexOf(process.env.BUCKETURL) === 0) key = key.replace(process.env.BUCKETURL, '')
        if (key.indexOf('/') === 0) key = key.replace('/', '')

        const getParams = {
            Bucket: process.env.BUCKETNAME,
            Key: key,
        }

        return new Promise((resolve, reject) =>
            this.s3.getObject(getParams, function (err: any, data: any) {
                if (err) return reject(err)

                resolve(data)
            })
        )
    }
}
