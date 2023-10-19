import { Request, Response, NextFunction } from 'express'
import { db } from '../core'
import { Op } from 'sequelize'
import { utils, log } from '../services'
import { Sequelize } from 'sequelize'

/**
 * Get pages metadata.
 * @param req RequesOt
 * @param res Response
 */
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pageMetadata:getAll')
        if (!utils.isDefined([req.params.projectId])) return res.status(400).send({ message: 'Project ID missing.' })

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId } })
        if (!design) return res.status(404).send({ message: 'Project not found.' })

        const pagesMetadata = await db.models.pageMetadata.findAll({ where: { designId: design.id }, attributes: ['path', 'metadata'], raw: true })

        return res.status(200).send(pagesMetadata)
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Update designVersions updatedAt.
 * @param req Request
 * @param res Response
 */
export const updateDesignVersionsUpdatedAt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pageMetadata:updateDesignVersionsUpdatedAt')
        
        const designVersions = await db.models.designVersion.findAll({
             where: { 
                designId: req.params.projectId,
                [Op.or]: [
                    { activeProd : true },
                    { activeStaging: true }
                ]
            }})
        for (const designVersion of designVersions) {
            // MUST BE DONE WITH RAW QUERY
            await db.query( `UPDATE "designVersions" SET "updatedAt" = '${new Date().toISOString()}' WHERE "id" = '${designVersion.id}'`)
        }

        return next()

    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Create pages metadata.
 * @param req Request
 * @param res Response
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await db.transaction()
    try {
        log.debug('controllers:pageMetadata:create')
        if (!utils.isDefined([req.params.projectId])) return res.status(400).send({ message: 'Project ID missing.' })
        if (!Array.isArray(req.body.pagesMetadata)) return res.status(400).send({ message: 'Body should an array' })
        if (!req.body.pagesMetadata.every((item: any) => item.path)) return res.status(400).send({ message: 'Path missing in body.' })
        if (req.body.pagesMetadata.length > req.body.features.maxPageMetadata) return res.status(402).send({ message: 'The number of items exceed your plan.' })

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId }, raw: true })
        if (!design) return res.status(404).send({ message: 'Project not found.' })

        const metadata = req.body.pagesMetadata.map((item: any) => ({ path: parsePath(item.path), designId: design.id, metadata: item.metadata }))
        await db.models.pageMetadata.bulkCreate(metadata, { ignoreDuplicates: true, transaction })

        const count = await db.models.pageMetadata.count({ where: { designId: design.id }, transaction })
        if (count > req.body.features.maxPageMetadata) {
            await transaction.rollback()
            return res.status(402).send({ message: 'The number of items exceed your plan.' })
        }

        await transaction.commit()

        return res.status(200).send()
    } catch (err) /* istanbul ignore next */ {
        await transaction.rollback()
        return next(err)
    }
}

/**
 * Update pages metadata.
 * @param req Request
 * @param res Response
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await db.transaction()
    try {
        log.debug('controllers:pageMetadata:update')
        if (!utils.isDefined([req.params.projectId])) return res.status(400).send({ message: 'Project ID missing.' })
        if (!Array.isArray(req.body.pagesMetadata)) return res.status(400).send({ message: 'Body should an array' })
        if (!req.body.pagesMetadata.every((item: any) => item.path)) return res.status(400).send({ message: 'Path missing in body.' })

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId }, raw: true })
        if (!design) return res.status(404).send({ message: 'Project not found.' })

        for (const item of req.body.pagesMetadata) {
            await db.models.pageMetadata.update({ metadata: item.metadata }, { where: { path: parsePath(item.path), designId: design.id }, transaction })
        }

        await transaction.commit()

        return res.status(200).send()
    } catch (err) /* istanbul ignore next */ {
        await transaction.rollback()
        return next(err)
    }
}

/**
 * Create or Update pages metadata.
 * @param req Request
 * @param res Response
 */
export const createOrUpdate = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await db.transaction()
    try {
        log.debug('controllers:pageMetadata:createOrUpdate')
        if (!utils.isDefined([req.params.projectId])) return res.status(400).send({ message: 'Project ID missing.' })
        if (!Array.isArray(req.body.pagesMetadata)) return res.status(400).send({ message: 'Body should an array' })
        if (!req.body.pagesMetadata.every((item: any) => item.path)) return res.status(400).send({ message: 'Path missing in body.' })

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId }, raw: true })
        if (!design) return res.status(404).send({ message: 'Project not found.' })

        if (req.body.pagesMetadata.length > req.body.features.maxPageMetadata) return res.status(402).send({ message: 'The number of items exceed your plan.' })

        const metadata = req.body.pagesMetadata.map((item: any) => ({ path: parsePath(item.path), designId: design.id, metadata: item.metadata }))
        await db.models.pageMetadata.bulkCreate(metadata, { updateOnDuplicate: ['metadata'], transaction })

        const count = await db.models.pageMetadata.count({ where: { designId: design.id }, transaction })
        if (count > req.body.features.maxPageMetadata) {
            await transaction.rollback()
            return res.status(402).send({ message: 'The number of items exceed your plan.' })
        }

        await transaction.commit()

        return res.status(200).send()
    } catch (err) /* istanbul ignore next */ {
        await transaction.rollback()
        return next(err)
    }
}

/**
 * Delete pages metadata.
 * @param req Request
 * @param res Response
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await db.transaction()
    try {
        log.debug('controllers:pageMetadata:remove')
        if (!utils.isDefined([req.params.projectId])) return res.status(400).send({ message: 'Project ID missing.' })
        if (!Array.isArray(req.body.pagesMetadata)) return res.status(400).send({ message: 'Body should an array' })
        if (!req.body.pagesMetadata.every((item: any) => item.path)) return res.status(400).send({ message: 'Path missing in body.' })

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId }, raw: true })
        if (!design) return res.status(404).send({ message: 'Project not found.' })

        const paths = req.body.pagesMetadata.map((item: any) => parsePath(item.path))
        const deleted = await db.models.pageMetadata.destroy({ where: { path: paths, designId: design.id }, transaction })

        await transaction.commit()

        return res.status(200).send({ deleted })
    } catch (err) /* istanbul ignore next */ {
        await transaction.rollback()
        return next(err)
    }
}

const parsePath = (path: string) => {
    if (path.startsWith('/')) path = path.substring(1)
    if (path.endsWith('/')) path = path.slice(0, -1)
    return path
}


/**
 * Set sitemap.xml
 * @param req Request
 * @param res Response
 */
export const setSitemapXml = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pageMetadata:setSitemapXml')

        if (!utils.isDefined([req.params.projectId, req.body.sitemapXml])) return res.status(400).send()

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId } })
        if (!design) return res.status(404).send()

        await db.models.design.update({ sitemapXml: req.body.sitemapXml }, { where: { designId: req.params.projectId } })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Get sitemap.xml
 * @param req Request
 * @param res Response
 */
export const getSitemapXml = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pageMetadata:getSitemapXml')

        if (!utils.isDefined([req.params.projectId])) return res.status(400).send()

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId } })
        if (!design) return res.status(404).send()

        return res
            .status(200)
            .set({ 'cache-control': 'no-cache' })
            .send({ sitemapXml: design.sitemapXml || null })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Set robots.txt
 * @param req Request
 * @param res Response
 */
export const setRobotsTxt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pageMetadata:setRobotsTxt')

        if (!utils.isDefined([req.params.projectId, req.body.robotsTxt])) return res.status(400).send()

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId } })
        if (!design) return res.status(404).send()

        await db.models.design.update({ robotsTxt: req.body.robotsTxt }, { where: { designId: req.params.projectId } })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Get robots.txt
 * @param req Request
 * @param res Response
 */
export const getRobotsTxt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pageMetadata:getRobotsTxt')

        if (!utils.isDefined([req.params.projectId])) return res.status(400).send()

        const design = await db.models.design.findOne({ where: { designId: req.params.projectId } })
        if (!design) return res.status(404).send()

        return res
            .status(200)
            .set({ 'cache-control': 'no-cache' })
            .send({ robotsTxt: design.robotsTxt || null })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
