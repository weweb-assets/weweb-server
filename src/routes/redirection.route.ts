import { Application } from 'express'
import { redirection as redirectionCtrl } from '../controllers'
import { utils } from '../services'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Redirection Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions/:designVersionId/redirections` as string).post(
        wwmt.verifyWwServiceToken,
        redirectionCtrl.createRedirection
    )
}
