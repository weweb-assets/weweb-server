import { Request, Response, NextFunction } from 'express'
import { website as websiteCore, db } from '../core'
import { utils, log } from '../services'
import { Op } from 'sequelize'
const wwmt = require('weweb-microservice-token')

/**
 * Get design versions.
 * @param req Request
 * @param res Response
 */
export const getDesignVersions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:getDesignVersions')
        if (!utils.isDefined([req.params.designId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersions = await db.models.designVersion.findAll({
            where: { designId: req.params.designId },
        })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data: designVersions })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

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

        const designVersion = await db.models.designVersion.create({
            designId: req.params.designId,
            designVersionId: req.body.designVersionId,
            cacheVersion: req.body.cacheVersion,
            homePageId: req.body.homePageId,
            langs: req.body.langs,
        })

        const design = await db.models.design.findOne({ where: { designId: req.params.designId } })
        if (design) {
            await design.update({ name: req.body.domain || null })
        } else {
            await db.models.design.create({
                designId: req.params.designId,
                name: req.body.domain || null,
            })
        }

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data: designVersion })
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

        if (req.body.env === 'staging') {
            // Set target version to activeStaging: true
            await db.models.designVersion.update({ activeStaging: false }, { where: { designId: req.params.designId, activeStaging: true } })
            await db.models.designVersion.update({ activeStaging: true }, { where: { id: designVersion.id } })
        } else {
            // Set target version to activeStaging: true and activeProd: true
            await db.models.designVersion.update(
                { activeProd: false, activeStaging: false },
                { where: { designId: req.params.designId, [Op.or]: [{ activeProd: true }, { activeStaging: true }] } }
            )
            await db.models.designVersion.update({ activeProd: true, activeStaging: true, activeBackup: true }, { where: { id: designVersion.id } })
        }

        await websiteCore.cleanBackups(req.params.designId)

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Release version.
 * @param req Request
 * @param res Response
 */
export const release = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:release')
        if (!utils.isDefined([req.params.designId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findOne({
            where: {
                designId: req.params.designId,
                ...(req.body.cacheVersion ? { cacheVersion: req.body.cacheVersion } : { activeStaging: true }),
            },
        })
        if (!designVersion) return res.status(404).send({ success: false, code: 'NOT_FOUND' })
        if (designVersion.activeProd) return res.status(200).send({ success: true })

        await db.models.designVersion.update({ activeProd: false }, { where: { designId: req.params.designId, activeProd: true } })
        await designVersion.update({ activeProd: true, activeBackup: true }, { where: { id: designVersion.id } })

        await websiteCore.cleanBackups(req.params.designId)

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Set checkpoint.
 * @param req Request
 * @param res Response
 */
export const checkpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:checkpoint')
        if (!utils.isDefined([req.params.designId, req.params.cacheVersion])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findOne({
            where: {
                designId: req.params.designId,
                cacheVersion: req.params.cacheVersion,
            },
        })
        if (!designVersion) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const { body: design } = await wwmt.get(`${process.env.WEWEB_BACK_URL}/v1/microservice/designs/${req.params.designId}`)

        const features = { ...design.features, ...design.customFeatures }
        const maxCheckpoints = features.checkpoints || 0
        const nbCheckpoints = await db.models.designVersion.count({ where: { designId: req.params.designId, activeCheckpoint: true } })
        if (nbCheckpoints + (!designVersion.activeCheckpoint ? 1 : -1) > maxCheckpoints) return res.status(402).send({ code: 'CHECKPOINTS_LIMIT' })

        await designVersion.update({ activeCheckpoint: !designVersion.activeCheckpoint })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
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

        const designToDestroy = await db.models.design.findOne({
            where: {
                designId: req.params.designId,
            },
        })

        if (designToDestroy) await designToDestroy.destroy()

        const designVersionsToDestroy = await db.models.designVersion.findAll({
            where: {
                designId: req.params.designId,
            },
        })

        for (const designVersionToDestroy of designVersionsToDestroy) {
            await designVersionToDestroy.destroy()
        }

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
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
                activeProd: true,
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

        return res.status(200).set({ 'cache-control': 'no-cache' }).send(allRoutesHtml)
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

        const designVersions = await db.models.designVersion.findAll({ where: { designId: req.params.designId }, limit: 10, order: [['createdAt', 'DESC']] })

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
                activeProd: designVersion.activeProd,
                activeStaging: designVersion.activeStaging,
                filesOk,
                createdAt: designVersion.createdAt,
            })
        }

        res.status(200).set({ 'cache-control': 'no-cache' }).send({ cacheVersions: cacheVersions })
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

        const design = await db.models.design.findOne({ where: { designId: req.params.designId } })

        if (!design) return res.status(404).send({ success: false, code: 'DESIGN_NOT_FOUND' })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ domain: design.name, stagingDomain: design.stagingName })
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

        if (!req.params.designId) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const design = await db.models.design.findOne({ where: { designId: req.params.designId } })

        if (design) {
            await design.update({ name: req.body.domain || null, stagingName: req.body.stagingDomain || null })
        } else {
            await db.models.design.create({
                designId: req.params.designId,
                name: req.body.domain || null,
                stagingName: req.body.stagingDomain || null,
            })
        }

        res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return res.status(404).send()
    }
}

/**
 * Get config.
 * @param req Request
 * @param res Response
 */
export const getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:getConfig')

        if (!utils.isDefined([req.params.projectId, req.params.version])) return res.status(400).send()

        const designVersion = await db.models.designVersion.findOne({
            where: { designId: req.params.projectId, cacheVersion: req.params.version },
            include: [
                { model: db.models.page, separate: true },
                { model: db.models.pluginSettings, separate: true },
                { model: db.models.redirection, separate: true },
                { model: db.models.cmsDataSet, separate: true },
            ],
        })
        if (!designVersion) return res.status(404).send()

        const design = await db.models.design.findOne({
            where: { designId: req.params.projectId },
            raw: true,
        })
        if (!design) return res.status(404).send()

        return res
            .status(200)
            .set({ 'cache-control': 'no-cache' })
            .send({ ...designVersion.toJSON(), design })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Get versions.
 * @param req Request
 * @param res Response
 */
export const publicGetVersions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:publicGetVersions')

        if (!utils.isDefined([req.params.projectId])) return res.status(400).send()

        const designVersions = await db.models.designVersion.findAll({
            where: { designId: req.params.projectId },
            attributes: ['cacheVersion', 'activeProd', 'activeStaging'],
        })

        const versionsList = designVersions.map(designVersion => {
            return { version: designVersion.cacheVersion, prod: designVersion.activeProd, staging: designVersion.activeStaging }
        })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data: versionsList })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Set version as active.
 * @param req Request
 * @param res Response
 */
export const publicSetVersionActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:designVersion:publicSetVersionActive')

        if (!utils.isDefined([req.params.projectId, req.params.version])) return res.status(400).send()

        const designVersion = await db.models.designVersion.findOne({ where: { designId: req.params.projectId, cacheVersion: req.params.version } })
        if (!designVersion) return res.status(404).send()

        try {
            const key = `${websiteCore.getCachePath(designVersion.designId, designVersion.designVersionId, `${designVersion.cacheVersion}`)}/index.html`
            if (!(await websiteCore.getFile(key))) return res.status(404).send({ success: false, message: 'FILES_NOT_FOUND' })
        } catch {
            return res.status(404).send({ success: false, message: 'FILES_NOT_FOUND' })
        }

        if (req.body.env === 'staging' || req.query.env === 'staging') {
            await db.models.designVersion.update({ activeStaging: false }, { where: { designId: req.params.projectId, activeStaging: true } })
            await new Promise(resolve => {
                setTimeout(resolve, 200)
            })
            await db.models.designVersion.update({ activeStaging: true }, { where: { designId: req.params.projectId, cacheVersion: req.params.version } })
        } else {
            await db.models.designVersion.update({ activeProd: false }, { where: { designId: req.params.projectId, activeProd: true } })
            await new Promise(resolve => {
                setTimeout(resolve, 200)
            })
            await db.models.designVersion.update({ activeProd: true }, { where: { designId: req.params.projectId, cacheVersion: req.params.version } })
        }

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
