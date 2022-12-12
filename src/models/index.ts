import { Sequelize } from 'sequelize'
/*=============================================m_ÔÔ_m=============================================\
    Import Models
\================================================================================================*/
import * as designVersion from './designVersion.model'
import * as page from './page.model'
import * as redirection from './redirection.model'
import * as pluginSettings from './pluginSettings.model'
import * as cmsDataSet from './cmsDataSet.model'
import * as design from './design.model'

/*=============================================m_ÔÔ_m=============================================\
    Initialize Models
\================================================================================================*/
export default (sequelize: Sequelize) => {
    designVersion.init(sequelize)
    page.init(sequelize)
    redirection.init(sequelize)
    pluginSettings.init(sequelize)
    cmsDataSet.init(sequelize)
    design.init(sequelize)
}

/*=============================================m_ÔÔ_m=============================================\
    Export Models
\================================================================================================*/
export type models = {
    designVersion: designVersion.DesignVersionStatic
    page: page.PageStatic
    redirection: redirection.RedirectionStatic
    pluginSettings: pluginSettings.PluginSettingsStatic
    cmsDataSet: cmsDataSet.CmsDataSetStatic
    design: design.DesignStatic
}

export { page, redirection, designVersion, pluginSettings, cmsDataSet, design }
