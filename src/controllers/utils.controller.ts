import { Request, Response, NextFunction } from 'express'

/**
 * Ping.
 * @param req Request
 * @param res Response
 */
export const ping = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.status(200).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
