import { Request, Response, NextFunction } from 'express'
import { db } from '../core'
import { utils, log } from '../services'
import { RequestWebsite } from 'ww-request'
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
export const updateAuth0CurrentUser = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:pluginSettings:updateAuth0CurrentUser')

        if (!process.env.WEWEB_PLUGINS_URL) return res.status(403).send('FEATURE_NOT_AVAILABLE')

        if (!utils.isDefined([req.designVersion.designId, req.params.settingsId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        if (req.headers['x-weweb-cookies']) {
            try {
                const cookies = JSON.parse(`${req.headers['x-weweb-cookies']}`)
                req.cookies.session = cookies.session
            } catch (err) {
                log.error(err)
            }
        }
        if (!req.cookies.session) return res.status(401).send('UNAUTHORIZED')

        const settings = await db.models.pluginSettings.findOne({
            where: { designVersionId: req.designVersion.id, pluginId: 'e93a2dfd-9b19-473e-b445-c666fed4e14a' },
        })
        if (!settings) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const { body: data } = await wwmt.post(
            `${process.env.WEWEB_PLUGINS_URL}/microservice/designs/${req.designVersion.designId}/settings/${settings.id}/auth0/users/current`,
            { settings, ...req.body },
            null,
            { Cookie: 'session=' + req.cookies.session }
        )

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
