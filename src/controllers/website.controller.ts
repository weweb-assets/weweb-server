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

            const noCacheFiles = ['robots.txt', 'sitemap.xml']
            let cacheControl = 'public, max-age=31536000'
            if (noCacheFiles.includes(lastPath)) {
                cacheControl = 'no-cache'
            }
            let file

                file = await websiteCore.getFile(key)

            const headers = {
                'Content-Type': mime.lookup(key),
                'Content-Length': file['ContentLength'],
                'Content-Encoding': file['ContentEncoding'],
                ETag: file['ETag'],
                'last-modified': new Date(req.designVersion.createdAt).toUTCString(),
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

        let cacheControl = 'public, max-age=31536000'
        if (req.isPrivate) {
            cacheControl = 'no-cache'
        }

        let file

            file = await websiteCore.getFile(key)

        const headers = {
            'Content-Type': mime.lookup(key),
            'Content-Length': file['ContentLength'],
            'Content-Encoding': file['ContentEncoding'],
            ETag: file['ETag'],
            'last-modified': new Date(req.designVersion.createdAt).toUTCString(),
            'accept-ranges': file['AcceptRanges'],
            'cache-control': cacheControl,
        }

        if (!file['ContentEncoding']) delete headers['Content-Encoding']

        return res.status(200).set(headers).send(file.data)
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
            const path =
                req.designVersion.homePageId === req.page.pageId
                    ? 'index.html'
                    : `${req.page.paths[langParam || 'default'] || req.page.paths.default}/index.html`
            const lang = langParam ? `${langParam}/` : ''
            const key = `${websiteCore.getCachePath(
                req.designVersion.designId,
                req.designVersion.designVersionId,
                `${req.designVersion.cacheVersion}`
            )}/${lang}${path}`


            let file

                file = await websiteCore.getFile(key)

            const headers = {
                'Content-Type': mime.lookup(key),
                'Content-Length': file['ContentLength'],
                'Content-Encoding': file['ContentEncoding'],
                ETag: file['ETag'],
                'last-modified': new Date(req.designVersion.createdAt).toUTCString(),
                'accept-ranges': file['AcceptRanges'],
                'cache-control': 'no-cache',
            }

            if (!file['ContentEncoding']) delete headers['Content-Encoding']

            return res
                .status(req.is404 ? 404 : 200)
                .set(headers)
                .send(file.data)
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
