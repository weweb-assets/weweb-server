import { RequestWebsite } from 'ww-request'
import { Response } from 'express'
import { PluginSettings } from '../models/pluginSettings.model'
import { createClient } from '@supabase/supabase-js'

/**
 * SupabaseAuth core.
 * @export
 * @class Auth0
 */
export default class SupabaseAuth {
    /**
     * Creates an instance of SupabaseAuth.
     * @memberof SupabaseAuth
     */
    constructor() {}

    private async getUser(projectUrl: string, apiKey: string, accessToken: string, refreshToken: string) {
        const instance = createClient(projectUrl, apiKey)

        let { user, error: userError } = await instance.auth.api.getUser(accessToken)
        if (userError) {
            const response = await instance.auth.api.refreshAccessToken(refreshToken)
            if (response.error) throw response.error
            accessToken = response.data.access_token
            if (!accessToken) throw new Error('No access token')

            const responseUser = await instance.auth.api.getUser(accessToken)
            user = responseUser.user
            userError = responseUser.error
            if (userError) throw userError
        }

        return user
    }

    private async getUserRoles(projectUrl: string, apiKey: string, roleTable: string, userRoleTable: string, userId: any) {
        const instance = createClient(projectUrl, apiKey)

        if (!roleTable || !userRoleTable) return []

        const { data: userRoles, error: userRolesError } = await instance.from(userRoleTable).select('roleId').eq('userId', userId)
        if (userRolesError) throw userRolesError

        return userRoles.map(({ roleId }) => ({ id: roleId }))
    }

    public async ensureAuth(req: RequestWebsite, res: Response, settings: PluginSettings) {
        const { projectUrl } = settings.publicData
        const { apiKey } = settings.privateData
        const { roleTable, userRoleTable } = settings.publicData

        try {
            const accessToken = req.cookies[`sb-access-token`]
            if (!accessToken) throw new Error('No access token')
            const refreshToken = req.cookies[`sb-refresh-token`]
            if (!refreshToken) throw new Error('No refresh token')

            const user = await this.getUser(projectUrl, apiKey, accessToken, refreshToken)
            if (req.page.userGroups.length === 1) return true

            const userRoles = await this.getUserRoles(projectUrl, apiKey, roleTable, userRoleTable, user.id)

            for (const userGroup of req.page.userGroups) {
                if (!userGroup) continue
                const rolesNotFound = userGroup.roles.filter((role: { value: string }) => !userRoles.find(userRole => userRole.id === role.value))
                if (!rolesNotFound.length) return true
            }
        } catch {}
        return false
    }
}
