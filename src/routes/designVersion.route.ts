import { Application } from 'express'
import { designVersion as designVersionCtrl } from '../controllers'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Design Version Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${process.env.SERVER_PATH}/microservice/designs/:designId/versions`)
        .post(wwmt.verifyWwServiceToken, designVersionCtrl.createDesignVersion)
        .delete(wwmt.verifyWwServiceToken, designVersionCtrl.deleteDesignVersions)

    app.route(`${process.env.SERVER_PATH}/microservice/designs/:designId/versions/:cacheVersion/active` as string).post(
        wwmt.verifyWwServiceToken,
        designVersionCtrl.setCacheVersionActive
    )

    app.route(`${process.env.SERVER_PATH}/admin/designs/:designId/previews`).get(designVersionCtrl.getAllRoutes)
}
