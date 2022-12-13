import { Request, Response, NextFunction } from 'express'
import { website as websiteCore, db } from '../core'
import { log } from '../services'

/**
 * Ping.
 * @param req Request
 * @param res Response
 */
export const ping = async (req: Request, res: Response, next: NextFunction) => {
    // log.debug('controllers:utils:ping')
    try {
        return res.status(200).set({ 'cache-control': 'no-cache' }).send({ success: true })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Get version.
 * @param req Request
 * @param res Response
 */
export const version = async (req: Request, res: Response, next: NextFunction) => {
    try {
        log.debug('controllers:utils:version')

        //If HIDE_VERSION, disable route.
        if (process.env.HIDE_VERSION) throw new Error()

        const version = process.env.npm_package_version.split('.')

        res.status(200)
            .set({ 'cache-control': 'no-cache' })
            .send({ major: parseInt(version[0]), minor: parseInt(version[1]), patch: parseInt(version[2]) })
    } catch (err) /* istanbul ignore next */ {
        return res.status(404).send()
    }
}

/**
 * Ping.
 * @param req Request
 * @param res Response
 */
export const testConfig = async (req: Request, res: Response, next: NextFunction) => {
    log.debug('controllers:utils:testConfig')

    //If HIDE_VERSION, disable route.
    if (process.env.HIDE_VERSION) throw new Error()

    if (!req.body.publicKey || !req.body.privateKey) return res.status(400).send({ success: false, message: 'BAD_PARAMS' })

    let filesOk,
        filesStorage = 'NONE',
        dataBaseOk,
        publicKeyOk,
        privateKeyOk,
        filesPath = process.env.FILES_PATH

    try {
        const { storage, connected } = await websiteCore.testFiles()
        filesOk = connected
        filesStorage = storage
    } catch (error) {
        log.error(error)
        filesOk = false
    }
    try {
        await db.models.designVersion.findOne()
        log.debug('Database connection is ok')
        dataBaseOk = true
    } catch (error) {
        log.error(error)
        dataBaseOk = false
    }
    try {
        publicKeyOk = process.env.PUBLIC_KEY === req.body.publicKey
        if (publicKeyOk) log.debug('PUBLIC_KEY is ok')
        else log.error('Missing or wrong PUBLIC_KEY environment variable')

        privateKeyOk = process.env.PRIVATE_KEY === req.body.privateKey
        if (privateKeyOk) log.debug('PRIVATE_KEY is ok')
        else log.error('Missing or wrong PRIVATE_KEY environment variable')

        return res.status(200).set({ 'cache-control': 'no-cache' }).send({
            running: true,
            files: filesOk,
            filesStorage,
            filesPath,
            database: dataBaseOk,
            publicKey: publicKeyOk,
            privateKey: privateKeyOk,
        })
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
