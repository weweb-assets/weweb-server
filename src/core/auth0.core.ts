import { RequestWebsite } from 'ww-request'
import { Response } from 'express'
import auth0 from 'auth0'
import { OAuthClientOptions } from 'auth0'
import { PluginSettings } from '../models/pluginSettings.model'

/**
 * Auth0 core.
 * @export
 * @class Auth0
 */
export default class Auth0 {
    /**
     * Creates an instance of Auth0.
     * @memberof Auth0
     */
    constructor() {}

    /**
     * Get auth0 management client.
     * @memberof Auth0
     */
    public getManagementClient(domain: string, clientId: string, clientSecret: string) {
        return new auth0.ManagementClient({ domain, clientId, clientSecret, scope: 'read:users read:roles' })
    }

    /**
     * Get auth0 authentication client.
     * @memberof Auth0
     */
    public getAuthenticationClient(domain: string, clientId: string, clientSecret: string) {
        return new auth0.AuthenticationClient({ domain, clientId, clientSecret })
    }

    public async ensureAuth(req: RequestWebsite, res: Response, settings: PluginSettings, redirectUrl: string) {
        const { domain, M2MClientId, SPAClientId } = settings.publicData
        const { M2MClientSecret, SPAClientSecret } = settings.privateData

        const managementClient = this.getManagementClient(domain, M2MClientId, M2MClientSecret)
        const authenticationClient = this.getAuthenticationClient(domain, M2MClientId, M2MClientSecret)
        try {
            if (req.query.code) {
                const authAuthenticator = new auth0.OAuthAuthenticator({ clientId: SPAClientId, clientSecret: SPAClientSecret, baseUrl: domain })
                const token = await authAuthenticator.authorizationCodeGrant({ code: req.query.code as string, redirect_uri: redirectUrl })
                req.cookies.session = token.access_token
            }

            const profile = await authenticationClient.getProfile(req.cookies.session || '')
            const userRoles = await managementClient.getUserRoles({ id: profile.sub })

            if (req.page.userGroups.length === 1) return true
            for (const userGroup of req.page.userGroups) {
                if (!userGroup) continue
                const rolesNotFound = userGroup.roles.filter((role: { value: string }) => !userRoles.find((userRole: auth0.Role) => userRole.id === role.value))
                if (!rolesNotFound.length) return true
            }
        } catch {}
        return false
    }
}
