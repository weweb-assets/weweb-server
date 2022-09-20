import { Application } from 'express'
import { designVersion as designVersionCtrl } from '../controllers'
import { utils } from '../services'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Design Version Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions`)
        .post(wwmt.verifyWwServiceToken, designVersionCtrl.createDesignVersion)
        .delete(wwmt.verifyWwServiceToken, designVersionCtrl.deleteDesignVersions)

    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions/:cacheVersion/active` as string).post(
        wwmt.verifyWwServiceToken,
        designVersionCtrl.setCacheVersionActive
    )

    app.route(`${utils.getServerPath()}/microservice/designs/:designId/get_cache_versions`).post(wwmt.verifyWwServiceToken, designVersionCtrl.getCacheVersions)

    app.route(`${utils.getServerPath()}/microservice/designs/:designId/domain`)
        .get(wwmt.verifyWwServiceToken, designVersionCtrl.getDomain)
        .post(wwmt.verifyWwServiceToken, designVersionCtrl.updateDomain)

    app.route(`${utils.getServerPath()}/admin/designs/:designId/previews`).get(designVersionCtrl.getAllRoutes)
}
