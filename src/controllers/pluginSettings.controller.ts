import { Request, Response, NextFunction } from 'express'
import { db } from '../core'
import { utils, log } from '../services'
const wwmt = require('weweb-microservice-token')

/**
 * Create plugin settings.
 * @param req Request
 * @param res Response
 */
export const createPluginSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pluginSettings:createPluginSettings')
        if (!utils.isDefined([req.params.designId, req.params.designVersionId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findByPk(req.params.designVersionId)
        if (!designVersion) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const pluginSettings = await db.models.pluginSettings.create({
            designVersionId: designVersion.id,
            pluginId: req.body.pluginId,
            publicData: req.body.publicData,
            privateData: req.body.privateData,
        })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data: pluginSettings })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Create plugin settings.
 * @param req Request
 * @param res Response
 */
export const updateAuth0CurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pluginSettings:updateAuth0CurrentUser')

        if (!process.env.WEWEB_PLUGINS_URL) return res.status(403).send('FEATURE_NOT_AVAILABLE')

        if (!utils.isDefined([req.params.designId, req.params.settingsId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const settings = await db.models.pluginSettings.findByPk(req.params.settingsId)
        if (!settings) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const { body: data } = await wwmt.post(
            `${process.env.WEWEB_PLUGINS_URL}/microservice/designs/${req.params.designId}/settings/${settings.id}/auth0/users/current`,
            { settings, ...req.body },
            null,
            { session: req.cookies.session }
        )

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
