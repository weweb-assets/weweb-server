import { Request, Response, NextFunction } from 'express'
import { db } from '../core'
import { utils, log } from '../services'

/**
 * Create page.
 * @param req Request
 * @param res Response
 */
export const createPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:page:createPage')
        if (!utils.isDefined([req.params.designId, req.params.designVersionId, req.body.id, req.body.paths, req.body.userGroups]))
            return res.status(400).send({ success: false, code: 'BAD_PARAMS' })

        const designVersion = await db.models.designVersion.findByPk(req.params.designVersionId)
        if (!designVersion) return res.status(404).send({ success: false, code: 'NOT_FOUND' })

        const page = await db.models.page.create({
            designVersionId: designVersion.id,
            pageId: req.body.id,
            paths: req.body.paths,
            userGroups: req.body.userGroups,
        })

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true, data: page })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
