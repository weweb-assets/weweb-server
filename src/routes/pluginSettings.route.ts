import { Application } from 'express'
import { website as websiteMdwl } from '../middlewares'
import { pluginSettings as pluginSettingsCtrl } from '../controllers'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Plugin Settings Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${process.env.SERVER_PATH}/microservice/designs/:designId/versions/:designVersionId/plugin_settings` as string).post(
        wwmt.verifyWwServiceToken,
        pluginSettingsCtrl.createPluginSettings
    )
    app.route(`${process.env.SERVER_PATH}/ww/settings/:settingsId/auth0/users/current` as string).patch(websiteMdwl.ensureWebsite, pluginSettingsCtrl.updateAuth0CurrentUser)
}
