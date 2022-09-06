import { NextFunction, Request, Response } from 'express'
import { log } from '../services'

/**
 * Ensure middleware.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const ensureMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('middlewares:template:ensureMiddleware')

        return next()
    } catch (err) /* istanbul ignore next */ {
        log.error(err)
        return res.status(500).send()
    }
}
