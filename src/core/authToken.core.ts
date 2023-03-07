import { RequestWebsite } from 'ww-request'
import { Response } from 'express'
import { PluginSettings } from '../models/pluginSettings.model'
import axios from 'axios'
import _ from 'lodash'
import { log } from '../services'

/**
 * Auth0 core.
 * @export
 * @class AuthToken
 */
export default class AuthToken {
    /**
     * Creates an instance of Auth0.
     * @memberof AuthToken
     */
    constructor() {}

    public buildHeader(type: string, name: string, token: string) {
        switch (type) {
            case 'bearer-token':
                return { Authorization: `Bearer ${token}` }
            case 'basic-token':
                return { Authorization: `Basic ${token}` }
            case 'custom-header':
                return { [name]: token }
            default:
                return {}
        }
    }

    public async ensureAuth(req: RequestWebsite, res: Response, settings: PluginSettings, options: any = {}) {
        const { userEndpoint, refreshTokenEndpoint, refreshFieldRequest, refreshFieldResponse, type, name } = settings.publicData

        try {
            let accessToken = req.cookies['ww-auth-access-token']
            const refreshToken = req.cookies['ww-auth-refresh-token']
            if (refreshTokenEndpoint) {
                const { data } = await axios.post(refreshTokenEndpoint, { [refreshFieldRequest]: refreshToken })
                accessToken = _.get(data, refreshFieldResponse, data)
                res.cookie('ww-auth-access-token', accessToken)
            }
            const headers = { ...this.buildHeader(type, name, accessToken), ...(options.headers || {}) }
            const { data } = await axios.get(userEndpoint, { headers })

            const { roleKey, roleType, roleTypeKey, roles } = settings.privateData
            const userRoles = _.get(data, roleKey)

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
            log.debug(`core:authToken:core:ensureAuth ERROR`)
            log.debug(error)
        }
        return false
    }
}
