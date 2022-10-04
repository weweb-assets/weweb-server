import { NextFunction, Response } from 'express'
import { Op } from 'sequelize'
import { RequestWebsite } from 'ww-request'
import {
    auth0 as auth0Core,
    authToken as authTokenCore,
    db,
    website as websiteCore,
    wewebAuth as wewebAuthCore,
    supabaseAuth as supabaseAuthCore,
    openId as openIdCore,
} from '../core'
import { log } from '../services'

const internals = {
    getDesignVersionFromHost: async (host: string) => {
        let designVersion
        if (process.env.HOSTNAME_PREVIEW && host.indexOf(`.${process.env.HOSTNAME_PREVIEW}`) !== -1) {
            const designId = host.replace(`.${process.env.HOSTNAME_PREVIEW}`, '').toLowerCase()
            designVersion = await db.models.designVersion.findOne({ where: { designId, isActive: true } })
        } else {
            const designDomain = await db.models.designDomain.findOne({ where: { name: host } })
            if (!designDomain) {
                return null
            }
            designVersion = await db.models.designVersion.findOne({ where: { designId: designDomain.designId, isActive: true } })
        }

        if (!designVersion) {
            return null
        }

        return designVersion
    },
}

/**
 * Ensure website.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const ensureWebsite = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('middlewares:website:ensureWebsite')

        const xForwardedHost = req.get('X-Forwarded-Host')
        const host = req.get('host')
        if (xForwardedHost) {
            req.designVersion = await internals.getDesignVersionFromHost(xForwardedHost)
        }
        if (!req.designVersion && host) {
            req.designVersion = await internals.getDesignVersionFromHost(host)
        }

        if (!req.designVersion) {
            return res.status(404).set({ 'cache-control': 'no-cache' }).send()
        }

        return next()
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Ensure redirection.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const ensureRedirection = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('middlewares:website:ensureRedirection')

        const urlSource = req.url.replace('/', '')

        const redirection = await db.models.redirection.findOne({
            where: {
                designVersionId: req.designVersion.id,
                urlSource,
            },
            include: ['page'],
        })
        if (!redirection) return next()

        switch (redirection.targetType) {
            case 'page':
                if (!redirection.page) return websiteCore.redirectTo404(res, req.designVersion.id)

                const isHomePage = req.designVersion.homePageId === redirection.page.pageId
                const lang = req.params.lang || 'default'
                const defaultLang = req.designVersion.langs ? req.designVersion.langs.find(lang => lang.default) : null

                let path = isHomePage ? '' : redirection.page.paths[lang]
                if (defaultLang && defaultLang.isDefaultPath) {
                    path = `${defaultLang.lang}/${path}`
                }
                return res.set({ 'cache-control': 'no-cache' }).redirect(parseInt(redirection.status), `/${path}`)
            default:
                return res.set({ 'cache-control': 'no-cache' }).redirect(parseInt(redirection.status), redirection.urlTarget)
        }
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Ensure page.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const ensurePage = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('middlewares:website:ensurePage')
        req.params.path = req.params.path || ''

        if (req.params.path !== '' && !req.params.path.endsWith('/')) {
            let redirectUrl = req.originalUrl
            if (req.originalUrl.indexOf('?') !== -1) redirectUrl = redirectUrl.replace('?', '/?')
            else redirectUrl = `${redirectUrl}/`
            return res.set({ 'cache-control': 'no-cache' }).redirect(301, redirectUrl)
        }

        const pathWithoutTrailing = req.params.path !== '' ? req.params.path.slice(0, -1) : ''

        req.page = !req.params.path
            ? await db.models.page.findOne({
                  where: {
                      designVersionId: req.designVersion.id,
                      pageId: req.designVersion.homePageId,
                  },
              })
            : await db.models.page.findOne({
                  where: {
                      [Op.not]: { pageId: req.designVersion.homePageId },
                      designVersionId: req.designVersion.id,
                      [Op.or]: [
                          { paths: { [Op.contains]: { [req.params.lang || 'default']: req.params.path } } },
                          { paths: { [Op.contains]: { ['default']: req.params.path } } },
                          { paths: { [Op.contains]: { [req.params.lang || 'default']: pathWithoutTrailing } } },
                          { paths: { [Op.contains]: { ['default']: pathWithoutTrailing } } },
                      ],
                  },
              })
        if (!req.page) return websiteCore.redirectTo404(res, req.designVersion.id)

        return next()
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Ensure page from ID.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const ensurePageFromId = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('middlewares:website:ensurePageFromId')

        req.page = await db.models.page.findOne({
            where: {
                designVersionId: req.designVersion.id,
                pageId: { [Op.like]: `${req.params.pageId}%` },
            },
        })
        if (!req.page) {
            const redirectUrl = await websiteCore.get404Url(req.designVersion.id)
            return res.status(404).set({ 'cache-control': 'no-cache' }).send({ redirectUrl })
        }

        return next()
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

const AUTH0_PLUGIN_ID = 'e93a2dfd-9b19-473e-b445-c666fed4e14a'
const XANO_PLUGIN_ID = 'f5856798-485d-47be-b433-d43d771c64e1'
const AUTH_TOKEN_PLUGIN_ID = '41448d5d-ae26-49bd-82b6-1c79f462e972'
const WEWEB_AUTH_PLUGIN_ID = '6a64802c-52f8-4637-9932-580bf178aaa7'
const SUPABASE_AUTH_PLUGIN_ID = '1fa0dd68-5069-436c-9a7d-3b54c340f1fa'
const OPENID_PLUGIN_ID = '01af5352-af71-4382-844b-2ec141ff243b'
const AUTH_PLUGINS_ID = [AUTH0_PLUGIN_ID, XANO_PLUGIN_ID, AUTH_TOKEN_PLUGIN_ID, WEWEB_AUTH_PLUGIN_ID, SUPABASE_AUTH_PLUGIN_ID, OPENID_PLUGIN_ID]

/**
 * Ensure auth.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const ensureAuth = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug('middlewares:website:ensureAuth')

        if (!req.page.userGroups.length) return next()

        const pluginSettings = await db.models.pluginSettings.findOne({
            where: {
                designVersionId: req.designVersion.id,
                pluginId: AUTH_PLUGINS_ID,
            },
        })
        if (!pluginSettings) return next()

        const page = await db.models.page.findOne({
            where: {
                designVersionId: req.designVersion.id,
                pageId: pluginSettings.publicData.afterNotSignInPageId,
            },
        })
        if (!page) {
            return res
                .status(404)
                .set({ 'cache-control': 'no-cache' })
                .send({ redirectUrl: await websiteCore.get404Url(req.designVersion.id) })
        }

        const lang = (req.params.lang || req.query.wwlang) as string
        delete req.query.wwlang

        const path =
            page.pageId === req.designVersion.homePageId
                ? lang
                    ? `/${lang}/`
                    : '/'
                : lang
                ? `/${lang}/${page.paths[lang] || page.paths.default}`
                : `${page.paths.default}`
        const queries = Object.keys(req.query).map(key => `${key}=${req.query[key]}`)
        let redirectUrl = `${path}${queries.length ? `?${queries.join('&')}` : ''}`
        if (!redirectUrl.startsWith('/')) redirectUrl = `/${redirectUrl}`

        let isAuth = false
        switch (pluginSettings.pluginId) {
            case AUTH0_PLUGIN_ID:
                isAuth = await auth0Core.ensureAuth(req, res, pluginSettings, redirectUrl)
                break
            case XANO_PLUGIN_ID:
                pluginSettings.publicData.userEndpoint = pluginSettings.publicData.getMeEndpoint
                pluginSettings.publicData.type = `bearer-token`
            case AUTH_TOKEN_PLUGIN_ID:
                isAuth = await authTokenCore.ensureAuth(req, res, pluginSettings)
                break
            case WEWEB_AUTH_PLUGIN_ID:
                isAuth = await wewebAuthCore.ensureAuth(req, res, pluginSettings)
                break
            case SUPABASE_AUTH_PLUGIN_ID:
                isAuth = await supabaseAuthCore.ensureAuth(req, res, pluginSettings)
                break
            case OPENID_PLUGIN_ID:
                isAuth = await openIdCore.ensureAuth(req, res, pluginSettings)
                break
        }

        if (!isAuth) {
            return req.isIndexHtml
                ? res.set({ 'cache-control': 'no-cache' }).redirect(redirectUrl)
                : res.status(401).set({ 'cache-control': 'no-cache' }).send({ redirectUrl })
        }

        req.isPrivate = true

        return next()
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}
