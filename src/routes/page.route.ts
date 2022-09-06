import { Application } from 'express'
import { page as pageCtrl } from '../controllers'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Page Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${process.env.SERVER_PATH}/microservice/designs/:designId/versions/:designVersionId/pages` as string).post(wwmt.verifyWwServiceToken, pageCtrl.createPage)
}
