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
const wwmt = require('weweb-microservice-token')

const internals = {
    // Retrieve designVersion from the hostname
    getDesignVersionFromHost: async (host: string) => {
        if (process.env.HOSTNAME_PREVIEW && host.indexOf(`.${process.env.HOSTNAME_PREVIEW}`) !== -1) {
            /* WeWeb Preview
             ** {{designId}}.weweb-preview.io
             ** {{designId}}-staging.weweb-preview.io
             ** {{designId}}-102.weweb-preview.io
             ** {{designId}}-102-staging.weweb-preview.io
             */
            const envColumn = host.includes(`-staging.${process.env.HOSTNAME_PREVIEW}`) ? 'activeStaging' : 'activeProd'

            //Find designId & Version
            const params = host
                .replace(`-staging.${process.env.HOSTNAME_PREVIEW}`, '')
                .replace(`.${process.env.HOSTNAME_PREVIEW}`, '')
                .replace('https://', '')
                .replace('http://', '')
                .replace('/', '')
                .toLowerCase()
            const uidVersionRegex = /^([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})-?(\d+)?$/
            const matches = params.match(uidVersionRegex)
            if (matches.length !== 3) return null
            const designId = matches[1]
            const version = matches[2]

            if (version) return await db.models.designVersion.findOne({ where: { designId, cacheVersion: version } })
            return await db.models.designVersion.findOne({ where: { designId, [envColumn]: true } })
        } else {
            // mydomain.com or mystagingdomain.com
            const design = await db.models.design.findOne({ where: { [Op.or]: { name: host, stagingName: host } } })
            if (!design) return null
            const options = design.name === host ? { activeProd: true } : { activeStaging: true }
            return await db.models.designVersion.findOne({ where: { designId: design.designId, ...options } })
        }
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
        log.debug(`middlewares:website:ensureWebsite ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)

        const origin = req.get('origin')
        const xForwardedHost = req.get('X-Forwarded-Host')
        const host = req.get('host')
        let finalHost = ''
        if (origin) {
            req.designVersion = await internals.getDesignVersionFromHost(origin)
            finalHost = origin
        }
        if (!req.designVersion && xForwardedHost) {
            req.designVersion = await internals.getDesignVersionFromHost(xForwardedHost)
            finalHost = xForwardedHost
        }
        if (!req.designVersion && host) {
            req.designVersion = await internals.getDesignVersionFromHost(host)
            finalHost = host
        }

        req.finalHost = finalHost

        if (!req.designVersion) return res.status(404).set({ 'cache-control': 'no-cache' }).send()

        return next()
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

/**
 * Add View to Design.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const addViewToDesign = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug(`middlewares:website:addViewToDesign ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)


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
        log.debug(`middlewares:website:ensureRedirection ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)

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
                if (!redirection.page) return websiteCore.redirectTo404(res)

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
        log.debug(`middlewares:website:ensurePage ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)

        req.params.path = req.params.path || ''

        //Add trailling /
        if (req.params.path !== '' && !req.params.path.endsWith('/')) {
            let redirectUrl = req.originalUrl
            if (req.originalUrl.indexOf('?') !== -1) redirectUrl = redirectUrl.replace('?', '/?')
            else redirectUrl = `${redirectUrl}/`

            //Prevent double slashes on redirect urls
            while (redirectUrl.indexOf('//') !== -1) redirectUrl = redirectUrl.replace('//', '/')

            return res.set({ 'cache-control': 'no-cache' }).redirect(301, redirectUrl)
        }

        //Check default lang
        if (!req.params.lang) {
            const langs = req.designVersion.langs
            let defaultLang = null
            for (const lang of langs) {
                if (lang.isDefaultPath) defaultLang = lang.lang
            }

            if (defaultLang) {
                //Add default lang at the start of the path
                const redirectUrl = `/${defaultLang}${req.originalUrl.startsWith('/') ? req.originalUrl : `/${req.originalUrl}`}`
                return res.set({ 'cache-control': 'no-cache' }).redirect(301, redirectUrl)
            }
        }

        const pathWithoutTrailing = req.params.path !== '' ? req.params.path.slice(0, -1) : ''

        if (!req.params.path) {
            req.page = await db.models.page.findOne({
                where: {
                    designVersionId: req.designVersion.id,
                    pageId: req.designVersion.homePageId,
                },
            })
        } else {
            const dynamicPaths = generateDynamicPaths(pathWithoutTrailing.split('/'), false)
                .map((item: Array<String>) => item.join('/'))
                .sort()

            const where = {
                [Op.not]: { pageId: req.designVersion.homePageId },
                designVersionId: req.designVersion.id,
                [Op.or]: [
                    { paths: { [Op.contains]: { [req.params.lang || 'default']: req.params.path } } },
                    { paths: { [Op.contains]: { ['default']: req.params.path } } },
                    { paths: { [Op.contains]: { [req.params.lang || 'default']: pathWithoutTrailing } } },
                    { paths: { [Op.contains]: { ['default']: pathWithoutTrailing } } },
                    ...dynamicPaths.map((item: String) => ({ paths: { [Op.contains]: { [req.params.lang || 'default']: item } } })),
                    ...dynamicPaths.map((item: String) => ({ paths: { [Op.contains]: { ['default']: item } } })),
                ],
            }

            const pages = await db.models.page.findAll({
                where,
            })

            pages.sort((a, b) => (a.paths[req.params.lang || 'default'] > b.paths[req.params.lang || 'default'] ? -1 : 1))
            req.page = pages[0]
        }

        if (!req.page) {
            const page404 = await websiteCore.get404Page(req.designVersion)
            if (page404) {
                req.page = page404
                req.is404 = true
            } else {
                return websiteCore.redirectTo404(res)
            }
        }

        return next()
    } catch (err) /* istanbul ignore next */ {
        return next(err)
    }
}

const generateDynamicPaths = (array: any, isDeep: boolean): any => {
    if (array.length === 1) return isDeep ? [array[0], ':param'] : [[array[0]]]
    const result = []
    const arrayTmp = generateDynamicPaths(array.slice(1), true)
    for (const item of arrayTmp) {
        result.push([array[0], ...(Array.isArray(item) ? item : [item])])
        result.push([':param', ...(Array.isArray(item) ? item : [item])])
    }
    return result
}

/**
 * Ensure page from ID.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const ensurePageFromId = async (req: RequestWebsite, res: Response, next: NextFunction) => {
    try {
        log.debug(`middlewares:website:ensurePageFromId ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)

        req.page = await db.models.page.findOne({
            where: {
                designVersionId: req.designVersion.id,
                pageId: { [Op.like]: `${req.params.pageId}%` },
            },
        })
        if (!req.page) {
            return websiteCore.redirectTo404(res)
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
        log.debug(`middlewares:website:ensureAuth ${req.get('origin') || req.get('X-Forwarded-Host') || req.get('host')}${req.url}`)

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
            return websiteCore.redirectTo404(res)
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
                const xDataSource = req.finalHost.includes(`-staging.${process.env.HOSTNAME_PREVIEW}`)
                    ? pluginSettings.publicData.xDataSourceStaging
                    : pluginSettings.publicData.xDataSourceProd
                isAuth = await authTokenCore.ensureAuth(req, res, pluginSettings, { headers: xDataSource ? { 'X-Data-Source': xDataSource } : {} })
                break
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
