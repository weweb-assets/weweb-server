import { Response, NextFunction } from 'express'
import { log } from '../services'
import { RequestWebsite } from 'ww-request'
import { website as websiteCore } from '../core'
const mime = require('mime-types')
const wwmt = require('weweb-microservice-token')

/**
 * Get file from AWS.
 * @param req Request
 * @param res Response
 */
export const getFile = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug(`controllers:website:getFile ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)

        if (!req.params.path) return res.status(404).send({ success: false, message: 'PATH_NOT_FOUND' })
        const path = req.params.path

        const lastPath = path.split('/').pop()

        if (lastPath.includes('.') && !lastPath.endsWith('.')) {
            const key = `${websiteCore.getCachePath(
                req.designVersion.designId,
                req.designVersion.designVersionId,
                `${req.designVersion.cacheVersion}`
            )}/${path}`

            let file


                file = await websiteCore.getFile(key)


            const noCacheFiles = ['robots.txt', 'sitemap.xml']
            let cacheControl = 'public, max-age=31536000'
            if (noCacheFiles.includes(lastPath)) {
                cacheControl = 'public, max-age=1'

                if (lastPath === 'sitemap.xml' && req.design.sitemapXml?.length) {
                    file = {
                        data: req.design.sitemapXml,
                        'Content-Length': req.design.sitemapXml.length,
                    }
                }

                if (lastPath === 'robots.txt' && req.design.robotsTxt?.length) {
                    file = {
                        data: req.design.robotsTxt,
                        'Content-Length': req.design.robotsTxt.length,
                    }
                }
            }

            const headers = {
                'Content-Type': lastPath === 'sitemap.xml' ? 'application/rss+xml' : mime.lookup(key),
                'Content-Length': file['ContentLength'],
                'Content-Encoding': file['ContentEncoding'],
                ETag: file['ETag'],
                'last-modified': req.lastModified,
                'accept-ranges': file['AcceptRanges'],
                'cache-control': cacheControl,
            }

            if (!file['ContentEncoding']) delete headers['Content-Encoding']

            return res.status(200).set(headers).send(file.data)
        } else {
            return next()
        }
    } catch (err) /* istanbul ignore next */ {
        log.error(`ERROR controllers:website:getFile ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)
        log.error(err)
        return res.status(404).send()
    }
}

/**
 * Get AWS file .
 * @param req Request
 * @param res Response
 */
export const getDataFile = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug(`controllers:website:getDataFile ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)

        if (!req.params.pageId) return res.status(404).send({ success: false, message: 'PAGE_NOT_FOUND' })
        const pageId = req.params.pageId

        const key = `${websiteCore.getCachePath(
            req.designVersion.designId,
            req.designVersion.designVersionId,
            `${req.designVersion.cacheVersion}`
        )}/public/data/${pageId}.json`

        let file


            file = await websiteCore.getFile(key)


        const headers = {
            'Content-Type': mime.lookup(key),
            'Content-Length': file['ContentLength'],
            'Content-Encoding': file['ContentEncoding'],
            ETag: file['ETag'],
            'last-modified': req.lastModified,
            'accept-ranges': file['AcceptRanges'],
            'cache-control': 'public, max-age=1',
        }

        if (!file['ContentEncoding']) delete headers['Content-Encoding']

        let pageJSON = file.data.toString('utf-8')

        if (req.query?.path) {
            let path = `${req.query?.path}`
            if (path.startsWith('/')) path = path.substring(1)
            if (path.endsWith('/')) path = path.slice(0, -1)
            

        }

        return res.status(200).set(headers).send(pageJSON)
    } catch (err) /* istanbul ignore next */ {
        log.error(`ERROR controllers:website:getDataFile ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)
        log.error(err)
        return res.status(404).send()
    }
}

/**
 * Get index from AWS.
 * @param req Request
 * @param res Response
 */
export const getIndex = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug(`controllers:website:getIndex ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)



        async function returnPageData(langParam: string) {
            //Fetch new version
            const path = req.designVersion.homePageId === req.page.pageId ? '' : `${req.page.paths[langParam || 'default'] || req.page.paths.default}`
            const lang = langParam ? `${langParam}` : ''
            let pathWithLang
            if (lang.length) {
                if (path.length) pathWithLang = `${lang}/${path}`
                else pathWithLang = lang
            } else {
                pathWithLang = path
            }
            const key = `${websiteCore.getCachePath(req.designVersion.designId, req.designVersion.designVersionId, `${req.designVersion.cacheVersion}`)}/${
                pathWithLang.length ? pathWithLang + '/' : ''
            }index.html`



            let file


                file = await websiteCore.getFile(key)


            const headers = {
                'Content-Type': mime.lookup(key),
                'Content-Length': file['ContentLength'],
                'Content-Encoding': file['ContentEncoding'],
                ETag: file['ETag'],
                'last-modified': req.lastModified,
                'accept-ranges': file['AcceptRanges'],
                'cache-control': 'public, max-age=1',
            }

            if (!file['ContentEncoding']) delete headers['Content-Encoding']

            let html = file.data.toString('utf-8')

            let cleanPath = `${req.path}`
            if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)
            if (cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1)



            return res
                .status(req.is404 ? 404 : 200)
                .set(headers)
                .send(html)
        }

        try {
            await returnPageData(req.params.lang)
        } catch (error) {
            const page404 = await websiteCore.get404Page(req.designVersion)
            if (page404) {
                req.page = page404
                req.is404 = true

                const designVersionLangs = req.designVersion.langs
                let langConfig = designVersionLangs.find(lc => lc.default)

                await returnPageData(langConfig.isDefaultPath ? langConfig.lang : null)
            } else {
                throw error
            }
        }
    } catch (err) /* istanbul ignore next */ {
        log.error(`ERROR controllers:website:getIndex ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)
        log.error(err)
        return websiteCore.redirectTo404(res)
    }
}
