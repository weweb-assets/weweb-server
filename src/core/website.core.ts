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
     * Replace dynamic metadata in a page HTML
     * @memberof Server
     */
    public async replacePageMetadataInHTML(design: any, pagePath: string, pageHtml: string) {
        const pageMetadata = await db.models.pageMetadata.findOne({ where: { path: pagePath, designId: design.id }, attributes: ['metadata'], raw: true })

        if (pageMetadata) {
            const metadata = pageMetadata.metadata
            const headRegex = /(<head>[\s\S.]*<\/head>)/im

            const matches = pageHtml.match(headRegex)
            if (matches?.[0]) {
                const dom = new JSDOM(matches[0])
                const document = dom.window.document
                const head = document.querySelector('head')

                const headCount = head.querySelector('meta[name="head:count"]')

                function insert(element: any) {
                    head.insertBefore(element, headCount)
                }

                /* TITLE
                    title
                    meta[name="title"]
                    meta[itemprop="name"]
                    meta[property="og:site_name"]
                */
                if (metadata.title) {
                    head.querySelector('title')?.remove()
                    const newTitle = document.createElement('title')
                    newTitle.innerHTML = metadata.title
                    insert(newTitle)

                    head.querySelector('meta[name="title"]')?.remove()
                    const newMetaTitle = document.createElement('meta')
                    newMetaTitle.setAttribute('name', 'title')
                    newMetaTitle.setAttribute('content', metadata.title)
                    insert(newMetaTitle)

                    head.querySelector('meta[itemprop="name"]')?.remove()
                    const newMetaItemPropName = document.createElement('meta')
                    newMetaItemPropName.setAttribute('itemprop', 'name')
                    newMetaItemPropName.setAttribute('content', metadata.title)
                    insert(newMetaItemPropName)

                    head.querySelector('meta[property="og:site_name"]')?.remove()
                    const newMetaPropertyOGSiteName = document.createElement('meta')
                    newMetaPropertyOGSiteName.setAttribute('property', 'og:site_name')
                    newMetaPropertyOGSiteName.setAttribute('content', metadata.title)
                    insert(newMetaPropertyOGSiteName)

                    head.querySelector('meta[property="og:title"]')?.remove()
                    const newMetaPropertyOGTitle = document.createElement('meta')
                    newMetaPropertyOGTitle.setAttribute('property', 'og:title')
                    newMetaPropertyOGTitle.setAttribute('content', metadata.title)
                    insert(newMetaPropertyOGTitle)

                    head.querySelector('meta[name="twitter:title"]')?.remove()
                    const newMetaPropertyTwitterTitle = document.createElement('meta')
                    newMetaPropertyTwitterTitle.setAttribute('name', 'twitter:title')
                    newMetaPropertyTwitterTitle.setAttribute('content', metadata.title)
                    insert(newMetaPropertyTwitterTitle)
                }

                /* FAVICON
                    link[rel="icon"]
                */
                if (metadata.favicon) {
                    head.querySelector('link[rel="icon"]')?.remove()
                    const newFavicon = document.createElement('link')
                    newFavicon.setAttribute('rel', 'icon')
                    newFavicon.setAttribute('href', metadata.favicon)
                    insert(newFavicon)
                }

                /* DESCRIPTION
                    meta[name="description"]
                    meta[itemprop="description"]
                */
                if (metadata.description) {
                    head.querySelector('meta[name="description"]')?.remove()
                    const newMetaDescription = document.createElement('meta')
                    newMetaDescription.setAttribute('name', 'description')
                    newMetaDescription.setAttribute('content', metadata.description)
                    insert(newMetaDescription)

                    head.querySelector('meta[itemprop="description"]')?.remove()
                    const newMetaItemPropDescription = document.createElement('meta')
                    newMetaItemPropDescription.setAttribute('itemprop', 'description')
                    newMetaItemPropDescription.setAttribute('content', metadata.description)
                    insert(newMetaItemPropDescription)

                    head.querySelector('meta[property="og:description"]')?.remove()
                    const newMetaPropertyOGDescription = document.createElement('meta')
                    newMetaPropertyOGDescription.setAttribute('property', 'og:description')
                    newMetaPropertyOGDescription.setAttribute('content', metadata.description)
                    insert(newMetaPropertyOGDescription)

                    head.querySelector('meta[name="twitter:description"]')?.remove()
                    const newMetaNameDescription = document.createElement('meta')
                    newMetaNameDescription.setAttribute('name', 'twitter:description')
                    newMetaNameDescription.setAttribute('content', metadata.description)
                    insert(newMetaNameDescription)
                }

                /* KEYWORDS
                    meta[name="keywords"]
                */
                if (metadata.keywords) {
                    head.querySelector('meta[name="keywords"]')?.remove()
                    const newMetaKeywords = document.createElement('meta')
                    newMetaKeywords.setAttribute('name', 'keywords')
                    newMetaKeywords.setAttribute('content', metadata.keywords)
                    insert(newMetaKeywords)
                }

                /* IMAGE
                    meta[name="image"]
                    meta[itemprop="image"]
                    meta[property="twitter:image"]
                    meta[property="og:image"]
                */
                if (metadata.image) {
                    head.querySelector('meta[name="image"]')?.remove()
                    const newMetaImage = document.createElement('meta')
                    newMetaImage.setAttribute('name', 'image')
                    newMetaImage.setAttribute('content', metadata.image)
                    insert(newMetaImage)

                    head.querySelector('meta[itemprop="image"]')?.remove()
                    const newMetaItemPropImage = document.createElement('meta')
                    newMetaItemPropImage.setAttribute('itemprop', 'image')
                    newMetaItemPropImage.setAttribute('content', metadata.image)
                    insert(newMetaItemPropImage)

                    head.querySelector('meta[name="twitter:image"]')?.remove()
                    const newMetaPropertyTwitterImage = document.createElement('meta')
                    newMetaPropertyTwitterImage.setAttribute('name', 'twitter:image')
                    newMetaPropertyTwitterImage.setAttribute('content', metadata.image)
                    insert(newMetaPropertyTwitterImage)

                    head.querySelector('meta[property="og:image"]')?.remove()
                    const newMetaPropertyOGImage = document.createElement('meta')
                    newMetaPropertyOGImage.setAttribute('property', 'og:image')
                    newMetaPropertyOGImage.setAttribute('content', metadata.image)
                    insert(newMetaPropertyOGImage)
                }

                if (metadata.meta?.length) {
                    for (const meta of metadata.meta) {
                        const selector = `meta${Object.keys(meta)
                            .map(key => {
                                if (key !== 'content') {
                                    return `[${key}="${meta[key]}"]`
                                }
                                return ''
                            })
                            .join('')}`
                        head.querySelector(selector)?.remove()
                        const newMeta = document.createElement('meta')
                        for (const key in meta) {
                            newMeta.setAttribute(key, meta[key])
                        }
                        insert(newMeta)
                    }
                }

                pageHtml = pageHtml.replace(headRegex, head.outerHTML)
            }
        }

        return pageHtml
    }

    /**
     * Replace dynamic metadata in a page JSON
     * @memberof Server
     */
    public async replacePageMetadataInJSON(design: any, pagePath: string, pageJSON: string) {
        const pageMetadata = await db.models.pageMetadata.findOne({ where: { path: pagePath, designId: design.id }, attributes: ['metadata'], raw: true })
        if (!pageMetadata) return pageJSON

        try {
            const metadata = pageMetadata.metadata
            const pageData = JSON.parse(pageJSON)
            if (pageData?.page) {
                pageData.page.title = pageData.page.title || {}
                pageData.page.favicon = pageData.page.favicon || ''
                pageData.page.metaImage = pageData.page.metaImage || ''
                pageData.page.meta = pageData.page.meta || {}

                if (metadata.title) pageData.page.title = { en: metadata.title }
                if (metadata.favicon) pageData.page.favicon = metadata.favicon
                if (metadata.description) pageData.page.meta.desc = { en: metadata.description }
                if (metadata.keywords) pageData.page.meta.keywords = { en: metadata.keywords }
                if (metadata.metaImage) pageData.page.metaImage = metadata.metaImage
                if (metadata.socialDesc) pageData.page.meta.socialDesc = { en: metadata.socialDesc }
                if (metadata.socialTitle) pageData.page.meta.socialTitle = { en: metadata.socialTitle }
                if (metadata.structuredData) pageData.page.meta.structuredData = { en: metadata.structuredData }
            }

            return JSON.stringify(pageData)
        } catch (e) {
            console.error(e)
            return pageJSON
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
