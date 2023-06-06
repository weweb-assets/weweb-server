import { Application } from 'express'
/*=============================================m_ÔÔ_m=============================================\
    Import Routes
\================================================================================================*/
import designVersionRoute from './designVersion.route'
import pageRoute from './page.route'
import redirectionRoute from './redirection.route'
import pluginSettingsRoute from './pluginSettings.route'
import cmsDataSetRoute from './cmsDataSet.route'
import openaiRoute from './openai.route'
import smartsuite from './smartsuite.route'
import utilsRoute from './utils.route'
import websiteRoute from './website.route'

/*=============================================m_ÔÔ_m=============================================\
    Initialize Routes
\================================================================================================*/
export default (app: Application) => {
    designVersionRoute(app)
    pageRoute(app)
    redirectionRoute(app)
    pluginSettingsRoute(app)
    cmsDataSetRoute(app)
    openaiRoute(app)
    smartsuite(app)
    utilsRoute(app)
    websiteRoute(app)
}
