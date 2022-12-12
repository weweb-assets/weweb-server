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

