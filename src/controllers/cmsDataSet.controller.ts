import { Request, Response, NextFunction } from 'express'
import { RequestWebsite } from 'ww-request'
import { db } from '../core'
import { utils, log } from '../services'
const wwmt = require('weweb-microservice-token')

/**
 * Create cmsDataSet.
 * @param req Request
 * @param res Response
 */
export const createCmsDataSet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:cmsDataSet:createCmsDataSet')
        if (!utils.isDefined([req.params.designId, req.params.designVersionId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findByPk(req.params.designVersionId)
        if (!designVersion) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const pluginSettings = await db.models.pluginSettings.findByPk(req.body.settingsId)
        if (!pluginSettings) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const cmsDataSet = await db.models.cmsDataSet.create({
            cmsDataSetId: req.body.id,
            designVersionId: designVersion.id,
            settingsId: pluginSettings.id,
            pluginId: req.body.pluginId,
            type: req.body.type,
            config: req.body.config,
            limit: req.body.limit,
            mode: req.body.mode,
            filter: req.body.filter,
            sort: req.body.sort,
        })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data: cmsDataSet })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Fetch cmsDataSet.
 * @param req Request
 * @param res Response
 */
export const fetchCmsDataSet = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:cmsDataSet:fetchCmsDataSet')

        if (!process.env.WEWEB_PLUGINS_URL) return res.status(403).send('FEATURE_NOT_AVAILABLE')

        if (!utils.isDefined([req.designVersion, req.params.cmsDataSetId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const cmsDataSet = await db.models.cmsDataSet.findOne({ where: { designVersionId: req.designVersion.id, cmsDataSetId: req.params.cmsDataSetId } })
        if (!cmsDataSet) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const settings = await db.models.pluginSettings.findByPk(cmsDataSet.settingsId)
        if (!settings) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const { body: data } = await wwmt.post(
            `${process.env.WEWEB_PLUGINS_URL}/microservice/designs/${req.designVersion.designId}/cms_data_sets/${cmsDataSet.cmsDataSetId}/fetch?limit=${req.query.limit}&offset=${req.query.offset}`,
            {
                cmsDataSet: { ...cmsDataSet.toJSON(), id: cmsDataSet.cmsDataSetId },
                settings: { ...settings.toJSON(), designId: req.designVersion.designId },
                variables: req.body.variables,
            }
        )

        return res.status(200).set({ 'cache-control': 'no-cache' }).send(data)
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Create Airtable record.
 * @param req Request
 * @param res Response
 */
export const createAirtableRecord = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:cmsDataSet:createAirtableRecord')

        if (!process.env.WEWEB_PLUGINS_URL) return res.status(403).send('FEATURE_NOT_AVAILABLE')

        if (!utils.isDefined([req.designVersion, req.params.cmsDataSetId, req.body.data])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const cmsDataSet = await db.models.cmsDataSet.findOne({ where: { designVersionId: req.designVersion.id, cmsDataSetId: req.params.cmsDataSetId } })
        if (!cmsDataSet) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const settings = await db.models.pluginSettings.findByPk(cmsDataSet.settingsId)
        if (!settings) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const { body: data } = await wwmt.post(
            `${process.env.WEWEB_PLUGINS_URL}/microservice/designs/${req.designVersion.designId}/cms_data_sets/${cmsDataSet.cmsDataSetId}/airtable/record`,
            {
                cmsDataSet: { ...cmsDataSet.toJSON(), id: cmsDataSet.cmsDataSetId },
                settings: { ...settings.toJSON(), designId: req.designVersion.designId },
                data: req.body.data,
            }
        )

        return res.status(200).set({ 'cache-control': 'no-cache' }).send(data)
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Update Airtable record.
 * @param req Request
 * @param res Response
 */
export const updateAirtableRecord = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:cmsDataSet:updateAirtableRecord')

        if (!process.env.WEWEB_PLUGINS_URL) return res.status(403).send('FEATURE_NOT_AVAILABLE')

        if (!utils.isDefined([req.designVersion, req.params.cmsDataSetId, req.params.recordId, req.body.data]))
            return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const cmsDataSet = await db.models.cmsDataSet.findOne({ where: { designVersionId: req.designVersion.id, cmsDataSetId: req.params.cmsDataSetId } })
        if (!cmsDataSet) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const settings = await db.models.pluginSettings.findByPk(cmsDataSet.settingsId)
        if (!settings) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const { body: data } = await wwmt.post(
            `${process.env.WEWEB_PLUGINS_URL}/microservice/designs/${req.designVersion.designId}/cms_data_sets/${cmsDataSet.cmsDataSetId}/airtable/record/${req.params.recordId}`,
            {
                cmsDataSet: { ...cmsDataSet.toJSON(), id: cmsDataSet.cmsDataSetId },
                settings: { ...settings.toJSON(), designId: req.designVersion.designId },
                data: req.body.data,
            }
        )

        return res.status(200).set({ 'cache-control': 'no-cache' }).send(data)
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Delete Airtable record.
 * @param req Request
 * @param res Response
 */
export const deleteAirtableRecord = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:cmsDataSet:deleteAirtableRecord')

        if (!process.env.WEWEB_PLUGINS_URL) return res.status(403).send('FEATURE_NOT_AVAILABLE')

        if (!utils.isDefined([req.designVersion, req.params.cmsDataSetId, req.params.recordId]))
            return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const cmsDataSet = await db.models.cmsDataSet.findOne({ where: { designVersionId: req.designVersion.id, cmsDataSetId: req.params.cmsDataSetId } })
        if (!cmsDataSet) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const settings = await db.models.pluginSettings.findByPk(cmsDataSet.settingsId)
        if (!settings) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const { body: data } = await wwmt.delete(
            `${process.env.WEWEB_PLUGINS_URL}/microservice/designs/${req.designVersion.designId}/cms_data_sets/${cmsDataSet.cmsDataSetId}/airtable/record/${req.params.recordId}`,
            {
                cmsDataSet: { ...cmsDataSet.toJSON(), id: cmsDataSet.cmsDataSetId },
                settings: { ...settings.toJSON(), designId: req.designVersion.designId },
            }
        )

        return res.status(200).set({ 'cache-control': 'no-cache' }).send(data)
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
