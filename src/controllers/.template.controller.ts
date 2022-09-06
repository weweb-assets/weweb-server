import { Request, Response, NextFunction } from 'express'
import { log } from '../services'
import { db } from '../core'

/**
 * Create something.
 * @param req Request
 * @param res Response
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:template:create')

        return res.status(200).send()
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
