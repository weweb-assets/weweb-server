import { Application } from 'express'
import { website as websiteMdwl } from '../middlewares'
import { pluginSettings as pluginSettingsCtrl } from '../controllers'
import { utils } from '../services'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Plugin Settings Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions/:designVersionId/plugin_settings` as string).post(
        wwmt.verifyWwServiceToken,
        pluginSettingsCtrl.createPluginSettings
    )
    app.route(`${utils.getServerPath()}/ww/settings/:settingsId/auth0/users/current` as string).patch(
        websiteMdwl.ensureWebsite,
        pluginSettingsCtrl.updateAuth0CurrentUser
    )
}
