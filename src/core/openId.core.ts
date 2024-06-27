import { RequestWebsite } from 'ww-request'
import { Response } from 'express'
import { PluginSettings } from '../models/pluginSettings.model'
import _ from 'lodash'
// @ts-ignore
import { Issuer, TokenSet, ClientMetadata } from 'openid-client'
import { log } from '../services'

/**
 * OpenId core.
 * @export
 * @class AuthToken
 */
export default class OpenId {
    /**
     * Creates an instance of Auth0.
     * @memberof OpenId
     */
    constructor() {}

    public async ensureAuth(req: RequestWebsite, res: Response, settings: PluginSettings) {
        try {
            const { domain, clientId, scope, responseType } = settings.publicData
            const { clientSecret } = settings.privateData

            const cookieName = encodeURIComponent(`oidc.user:${domain}:${clientId}`)

            let tokens = {}

            log.debug(`core:openId:core:ensureAuth cookieName ` + cookieName)
            log.debug(`core:openId:core:ensureAuth cookies ` + JSON.stringify(req.cookies))
            if (req.cookies[cookieName]) {
                let tokensCookie = decodeURIComponent(req.cookies[cookieName] || '{}')
                log.debug(`core:openId:core:ensureAuth tokens ` + tokensCookie)
                tokens = JSON.parse(tokensCookie)
            } else if (req.cookies[cookieName + '.access_token']) {
                const cookieAccessToken = req.cookies[cookieName + '.access_token']
                const cookieIdToken = req.cookies[cookieName + '.id_token']
                const cookieRefreshToken = req.cookies[cookieName + '.refresh_token']
                const cookieUserData = req.cookies[cookieName + '.user_data']

                tokens = {
                    access_token: cookieAccessToken === 'null' ? null : cookieAccessToken,
                    id_token: cookieIdToken === 'null' ? null : cookieIdToken,
                    refresh_token: cookieRefreshToken === 'null' ? null : cookieRefreshToken,
                    ...JSON.parse(decodeURIComponent(cookieUserData)),
                }
            }

            const issuer = await Issuer.discover(domain)
            const client = new issuer.Client({
                client_id: clientId,
                client_secret: clientSecret,
                scope: scope || 'openid',
                response_types: responseType || 'id_token',
            })

            const user = await client.userinfo(new TokenSet(tokens))
            log.debug(`core:openId:core:ensureAuth user ` + JSON.stringify(user))
            log.debug(`core:openId:core:ensureAuth roleKey ` + settings.publicData.roleKey)
            const { roleKey, roleType, roleTypeKey, roles } = settings.publicData
            const userRoles = _.get(user, roleKey) as any
            log.debug(`core:openId:core:ensureAuth userRoles ` + userRoles)

            if (req.page.userGroups.length === 1) return true
            for (const userGroup of req.page.userGroups) {
                if (!userGroup) continue
                const userGroupRoles = roles.filter((role: any) => userGroup.roles.find((userGroupRole: any) => userGroupRole.value === role.id))
                if (roleType === 'string') {
                    const rolesNotFound = userGroupRoles.filter(({ name }: { name: string }) => name != userRoles)
                    if (!rolesNotFound.length) return true
                } else if (roleType === 'array-string') {
                    const rolesNotFound = userGroupRoles.filter(({ name }: { name: string }) => !userRoles.find((userRole: string) => userRole === name))
                    if (!rolesNotFound.length) return true
                } else if (roleType === 'array-object') {
                    const rolesNotFound = userGroupRoles.filter(
                        ({ name }: { name: string }) => !userRoles.find((userRole: any) => userRole[roleTypeKey] === name)
                    )
                    if (!rolesNotFound.length) return true
                }
            }
        } catch (error) {
            log.debug(`core:openId:core:ensureAuth ERROR`)
            log.debug(error)
        }
        return false
    }
}
