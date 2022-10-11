import { Response, NextFunction } from 'express'
import { log } from '../services'
import { RequestWebsite } from 'ww-request'
import { website as websiteCore } from '../core'
const mime = require('mime-types')

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
            const key = `${websiteCore.getCachePath(req.designVersion.designId, req.designVersion.designVersionId, `${req.designVersion.cacheVersion}`)}/${
                req.params.path
            }`

            const stream = await websiteCore.streamFile(key)

            res.set({
                'content-type': mime.lookup(key),
                'cache-control': 'public, max-age=31536000',
                'last-modified': new Date(req.designVersion.createdAt).toUTCString(),
                date: new Date().toUTCString(),
            })

            stream.on('error', function (error: any) {
                res.status(error.statusCode || 404).end(error.message || 'FILE_NOT_FOUND')
            })

            return stream.pipe(res)
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

        let cacheControl = 'public, max-age=31536000'
        if (req.isPrivate) {
            cacheControl = 'no-cache'
        }

        const stream = await websiteCore.streamFile(key)

        res.set({
            'content-type': mime.lookup(key),
            'cache-control': cacheControl,
            'last-modified': new Date(req.designVersion.createdAt).toUTCString(),
            date: new Date().toUTCString(),
        })

        stream.on('error', function (error: any) {
            res.status(error.statusCode || 404).end(error.message || 'FILE_NOT_FOUND')
        })

        return stream.pipe(res)
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

        //Fetch new version
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

        const stream = await websiteCore.streamFile(key)

        if (process.env.HOSTNAME_PREVIEW && req.get('host').indexOf(`.${process.env.HOSTNAME_PREVIEW}`) !== -1) {
            res.set({
                'X-Robots-Tag': 'noindex',
            })
        }
        res.set({
            'content-type': mime.lookup(key),
            'cache-control': 'no-cache',
            'last-modified': new Date(req.designVersion.createdAt).toUTCString(),
            date: new Date().toUTCString(),
        })

        stream.on('error', function (error: any) {
            return websiteCore.redirectTo404(res, req.designVersion.id)
        })

        return stream.pipe(res)
    } catch (err) /* istanbul ignore next */ {
        return websiteCore.redirectTo404(res, req.designVersion.id)
    }
}
