import { Application } from 'express'
import { redirection as redirectionCtrl } from '../controllers'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Redirection Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${process.env.SERVER_PATH}/microservice/designs/:designId/versions/:designVersionId/redirections` as string).post(
        wwmt.verifyWwServiceToken,
        redirectionCtrl.createRedirection
    )
}
