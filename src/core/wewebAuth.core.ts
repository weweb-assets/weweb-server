import { RequestWebsite } from 'ww-request'
import { Response } from 'express'
import { PluginSettings } from '../models/pluginSettings.model'
import { CognitoIdentityServiceProvider } from 'aws-sdk'

const cognito = new CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_PROD || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_PROD || process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
})

/**
 * WeWebAuth core.
 * @export
 * @class Auth0
 */
export default class WeWebAuth {
    /**
     * Creates an instance of WeWebAuth.
     * @memberof WeWebAuth
     */
    constructor() {}

    private async getUserRoles(userPoolId: string, accessToken: string) {
        const awsUser = (await new Promise((resolve, reject) =>
            cognito.getUser({ AccessToken: accessToken }, (err, data) => (err ? reject(err) : resolve(data)))
        )) as AWS.CognitoIdentityServiceProvider.GetUserResponse

        const awsGroups = (await new Promise((resolve, reject) =>
            cognito.adminListGroupsForUser({ UserPoolId: userPoolId, Username: awsUser.Username }, (err, data) => (err ? reject(err) : resolve(data.Groups)))
        )) as AWS.CognitoIdentityServiceProvider.GroupListType

        return awsGroups
    }

    private async getAccessToken(userPoolId: string, clientId: string, refreshToken: string) {
        const awsTokens = (await new Promise((resolve, reject) =>
            cognito.adminInitiateAuth(
                { UserPoolId: userPoolId, ClientId: clientId, AuthFlow: 'REFRESH_TOKEN', AuthParameters: { REFRESH_TOKEN: refreshToken } },
                (err, data) => (err ? reject(err) : resolve(data.AuthenticationResult))
            )
        )) as AWS.CognitoIdentityServiceProvider.AuthenticationResultType

        return awsTokens.AccessToken
    }

    public async ensureAuth(req: RequestWebsite, res: Response, settings: PluginSettings) {
        const { userPoolId, clientId } = settings.publicData

        try {
            const userId = req.cookies[`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`]
            if (!userId) throw new Error('No user ID')
            const refreshToken = req.cookies[`CognitoIdentityServiceProvider.${clientId}.${userId}.refreshToken`]
            if (!refreshToken) throw new Error('No refresh token')

            const accessToken = await this.getAccessToken(userPoolId, clientId, refreshToken)
            // res.cookie(`CognitoIdentityServiceProvider.${clientId}.${userId}.accessToken`, accessToken)

            const userRoles = await this.getUserRoles(userPoolId, accessToken)

            if (req.page.userGroups.length === 1) return true
            for (const userGroup of req.page.userGroups) {
                if (!userGroup) continue
                const rolesNotFound = userGroup.roles.filter((role: { value: string }) => !userRoles.find(userRole => userRole.GroupName === role.value))
                if (!rolesNotFound.length) return true
            }
        } catch {}
        return false
    }
}
