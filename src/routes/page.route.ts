import { Application } from 'express'
import { page as pageCtrl } from '../controllers'
import { utils } from '../services'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Page Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions/:designVersionId/pages` as string).post(
        wwmt.verifyWwServiceToken,
        pageCtrl.createPage
    )
}
