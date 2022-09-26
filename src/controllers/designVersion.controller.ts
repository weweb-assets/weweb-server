import { Request, Response, NextFunction } from 'express'
import { website as websiteCore, db } from '../core'
import { utils, log } from '../services'

/**
 * Create design version.
 * @param req Request
 * @param res Response
 */
export const createDesignVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:createDesignVersion')
        if (!utils.isDefined([req.params.designId, req.body.designVersionId, req.body.cacheVersion, req.body.homePageId]))
            return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        if (!req.body.domain) {
            const _designVersion = await db.models.designVersion.findOne({ where: { designId: req.params.designId } })
            req.body.domain = _designVersion.domain
        }

        const designVersion = await db.models.designVersion.create({
            designId: req.params.designId,
            designVersionId: req.body.designVersionId,
            cacheVersion: req.body.cacheVersion,
            domain: req.body.domain,
            homePageId: req.body.homePageId,
            langs: req.body.langs,
        })

        return res.status(200).send({ success: true, data: designVersion })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Set design version active.
 * @param req Request
 * @param res Response
 */
export const setCacheVersionActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:setCacheVersionActive')
        if (!utils.isDefined([req.params.designId, req.params.cacheVersion])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findOne({
            where: {
                designId: req.params.designId,
                cacheVersion: req.params.cacheVersion,
            },
        })
        if (!designVersion) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        await db.models.designVersion.update({ isActive: false }, { where: { designId: req.params.designId, isActive: true } })

        await db.models.designVersion.update({ isActive: true }, { where: { id: designVersion.id } })

        return res.status(200).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Delete design versions.
 * @param req Request
 * @param res Response
 */
export const deleteDesignVersions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:deleteDesignVersions')
        if (!utils.isDefined([req.params.designId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersionsToDestroy = await db.models.designVersion.findAll({
            where: {
                designId: req.params.designId,
            },
        })

        for (const designVersionToDestroy of designVersionsToDestroy) {
            await designVersionToDestroy.destroy()
        }

        return res.status(200).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Get all routes from a design versions.
 * @param req Request
 * @param res Response
 */
export const getAllRoutes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:getAllRoutes')
        if (!utils.isDefined([req.params.designId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findOne({
            where: {
                designId: req.params.designId,
                isActive: true,
            },
        })

        const allPages = await db.models.page.findAll({
            where: {
                designVersionId: designVersion.id,
            },
        })

        const allRoutes = []

        for (const page of allPages) {
            for (const langParams of designVersion.langs) {
                const isHomePage = designVersion.homePageId === page.pageId
                const slugLang = langParams.isDefaultPath || !langParams.default
                const lang = langParams.lang
                const path = page.paths[lang] || page.paths.default

                const route = `${slugLang ? `/${lang}` : ''}${isHomePage ? '/' : `/${path}`}`

                if (isHomePage) {
                    allRoutes.unshift(route)
                } else {
                    allRoutes.push(route)
                }
            }
        }

        //return res.status(200).send(allRoutes)

        let allRoutesHtml = '<html><body style="font-family: Arial;">'

        for (const route of allRoutes) {
            allRoutesHtml += `<h1><a href="https://${designVersion.designId}.weweb-preview.io${route}" target="_blank">${
                route || '/'
            }</a></h1><img style="width: 900px; border: 1px solid black" src="${'https://cdn-websites.weweb.io'}/designs/${designVersion.designId}/cache/${
                designVersion.designVersionId
            }/${designVersion.cacheVersion}${route.endsWith('/') ? route : `${route}/`}screen.png" /><br/><br/><br/>`
        }

        allRoutesHtml += '</body></html>'

        return res.status(200).send(allRoutesHtml)
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Get version.
 * @param req Request
 * @param res Response
 */
export const getCacheVersions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:cacheVersions')

        if (!req.params.designId) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersions = await db.models.designVersion.findAll({ where: { designId: req.params.designId } })

        const cacheVersions = []
        for (const designVersion of designVersions) {
            let filesOk = false

            try {
                const key = `${websiteCore.getCachePath(designVersion.designId, designVersion.designVersionId, `${designVersion.cacheVersion}`)}/index.html`
                filesOk = !!(await websiteCore.getFile(key))
            } catch (error) {
                filesOk = false
            }

            cacheVersions.push({
                cacheVersion: designVersion.cacheVersion,
                isActive: designVersion.isActive,
                filesOk,
                createdAt: designVersion.createdAt,
            })
        }

        res.status(200).send({ cacheVersions: cacheVersions })
    } catch (err) /* istanbul ignore next */ {
        return res.status(404).send()
    }
}

/**
 * Get domain name.
 * @param req Request
 * @param res Response
 */
export const getDomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:getDomain')

        if (!req.params.designId) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findOne({ where: { designId: req.params.designId } })

        if (!designVersion) return res.status(404).send({ success: false, code: 'DESIGNVERSION_NOT_FOUND' })

        res.status(200).send({ domain: designVersion.domain })
    } catch (err) /* istanbul ignore next */ {
        return res.status(404).send()
    }
}

/**
 * Update domain.
 * @param req Request
 * @param res Response
 */
export const updateDomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:updateDomain')

        if (!req.params.designId || !req.body.domain) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersions = await db.models.designVersion.findAll({ where: { designId: req.params.designId } })

        for (const designVersion of designVersions) {
            await designVersion.update({ domain: req.body.domain })
        }

        res.status(200).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return res.status(404).send()
    }
}
