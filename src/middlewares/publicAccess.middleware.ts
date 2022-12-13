import { NextFunction, Response } from 'express'
import { Op } from 'sequelize'
import { RequestWebsite } from 'ww-request'
import { db } from '../core'
import { log } from '../services'

/**
 * Ensure website.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const ensurePublicAccess = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('ensurePublicAccess')
        if (!req.headers['authorization']) return res.status(401).send()

        // Check has token
        const token = req.headers['authorization'].replace('Bearer ', '')
        if (!token) return res.status(401).send()

        // Check valid token
        if (process.env.PRIVATE_KEY !== token) return res.status(401).send()

        return next()
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
