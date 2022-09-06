import { Application } from 'express'
import { utils as utilsCtrl } from '../controllers'

/*=============================================m_ÔÔ_m=============================================\
    Utils Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${process.env.SERVER_PATH}/ping`).get(utilsCtrl.ping)
}
