import { Application } from 'express'
import { utils as utilsCtrl } from '../controllers'
import { utils } from '../services'

/*=============================================m_ÔÔ_m=============================================\
    Utils Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/ping`).get(utilsCtrl.ping)
    app.route(`${utils.getServerPath()}/microservice/test_config`).post(utilsCtrl.testConfig)
    app.route(`${utils.getServerPath()}/microservice/version`).get(utilsCtrl.version)
}
