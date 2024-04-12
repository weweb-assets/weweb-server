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

            let tokensCookie = req.cookies[cookieName] || '{}'

            if (tokensCookie.startsWith('%')) {
                tokensCookie = decodeURIComponent(tokensCookie)
            }

            const tokens = JSON.parse(tokensCookie)

            const issuer = await Issuer.discover(domain)
            const client = new issuer.Client({
                client_id: clientId,
                client_secret: clientSecret,
                scope: scope || 'openid',
                response_types: responseType || 'id_token',
            })

            const user = await client.userinfo(new TokenSet(tokens))

            const { roleKey, roleType, roleTypeKey, roles } = settings.privateData
            const userRoles = _.get(user, roleKey) as any

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
