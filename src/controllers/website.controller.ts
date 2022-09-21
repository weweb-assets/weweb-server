import { Response, NextFunction } from 'express'
import { log, s3 } from '../services'
import { RequestWebsite } from 'ww-request'
import { website as websiteCore } from '../core'

/**
 * Get file from AWS.
 * @param req Request
 * @param res Response
 */
export const getFile = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:website:getFile')

        const lastPath = req.params.path.split('/').pop()

        if (lastPath.includes('.') && !lastPath.endsWith('.')) {
            //No cache for core files
            const noCacheFiles = ['robots.txt', 'sitemap.xml']
            let cacheControl = 'public, max-age=31536000'
            if (noCacheFiles.includes(lastPath)) {
                cacheControl = 'no-cache'
            }

            const key = `${websiteCore.getCachePath(req.designVersion.designId, req.designVersion.designVersionId, `${req.designVersion.cacheVersion}`)}/${
                req.params.path
            }`
            const file = await websiteCore.getFile(key)

            return res
                .status(200)
                .set({
                    'Content-Type': file['ContentType'],
                    'Content-Length': file['ContentLength'],
                    ETag: file['ETag'],
                    'last-modified': file['LastModified'],
                    'accept-ranges': file['AcceptRanges'],
                    'cache-control': cacheControl,
                })
                .send(file.data)
        } else {
            return next()
        }
    } catch (err) /* istanbul ignore next */ {
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
        log.debug('controllers:website:getDataFile')

        const key = `${websiteCore.getCachePath(
            req.designVersion.designId,
            req.designVersion.designVersionId,
            `${req.designVersion.cacheVersion}`
        )}/public/data/${req.params.pageId}.json`
        const file = await websiteCore.getFile(key)

        let cacheControl = 'public, max-age=31536000'
        if (req.isPrivate) {
            cacheControl = 'no-cache'
        }

        return res
            .status(200)
            .set({
                'Content-Type': file['ContentType'],
                'Content-Length': file['ContentLength'],
                ETag: file['ETag'],
                'last-modified': file['LastModified'],
                'accept-ranges': file['AcceptRanges'],
                'cache-control': cacheControl,
            })
            .send(file.data)
    } catch (err) /* istanbul ignore next */ {
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
        log.debug('controllers:website:getIndex')

        const path =
            req.designVersion.homePageId === req.page.pageId
                ? 'index.html'
                : `${req.page.paths[req.params.lang || 'default'] || req.page.paths.default}/index.html`
        const lang = req.params.lang ? `${req.params.lang}/` : ''
        const key = `${websiteCore.getCachePath(
            req.designVersion.designId,
            req.designVersion.designVersionId,
            `${req.designVersion.cacheVersion}`
        )}/${lang}${path}`
        const file = await websiteCore.getFile(key)

        if (process.env.HOSTNAME_PREVIEW && req.get('host').indexOf(`.${process.env.HOSTNAME_PREVIEW}`) !== -1) {
            file.data = file.data.toString('utf-8')
            file.data = file.data.replace(/<head><base\s.*?\/>/gi, '<head>')
            file.data = file.data.replace('<head>', '<head><meta name="robots" content="noindex, nofollow">')
        }

        return res
            .status(200)
            .set({
                'Content-Type': file['ContentType'],
                'Content-Length': file['ContentLength'],
                ETag: file['ETag'],
                'last-modified': file['LastModified'],
                'accept-ranges': file['AcceptRanges'],
                'cache-control': 'no-cache',
            })
            .send(file.data)
    } catch (err) /* istanbul ignore next */ {
        return websiteCore.redirectTo404(res, req.designVersion.id)
    }
}
