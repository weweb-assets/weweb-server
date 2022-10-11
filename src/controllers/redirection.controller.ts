import { Request, Response, NextFunction } from 'express'
import { db } from '../core'
import { utils, log } from '../services'

/**
 * Create redirection.
 * @param req Request
 * @param res Response
 */
export const createRedirection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:redirection:createRedirection')
        if (!utils.isDefined([req.params.designId, req.params.designVersionId])) return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findByPk(req.params.designVersionId)
        if (!designVersion) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const redirection = await db.models.redirection.create({
            designVersionId: designVersion.id,
            pageId: req.body.pageId,
            urlSource: req.body.urlSource,
            urlTarget: req.body.urlTarget,
            targetType: req.body.targetType,
            status: req.body.status,
        })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data: redirection })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
