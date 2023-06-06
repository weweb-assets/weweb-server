import { Application } from 'express'
import { designVersion as designVersionCtrl } from '../controllers'
import { publicAccess as publicAccessMdlw } from '../middlewares'
import { utils } from '../services'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Design Version Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions`)
        .get(wwmt.verifyWwServiceToken, designVersionCtrl.getDesignVersions)
        .post(wwmt.verifyWwServiceToken, designVersionCtrl.createDesignVersion)
        .delete(wwmt.verifyWwServiceToken, designVersionCtrl.deleteDesignVersions)

    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions/:cacheVersion/active` as string).post(
        wwmt.verifyWwServiceToken,
        designVersionCtrl.setCacheVersionActive
    )

    app.route(`${utils.getServerPath()}/microservice/designs/:designId/release` as string).post(wwmt.verifyWwServiceToken, designVersionCtrl.release)
    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions/:cacheVersion/checkpoint` as string).post(
        wwmt.verifyWwServiceToken,
        designVersionCtrl.checkpoint
    )
    app.route(`${utils.getServerPath()}/microservice/designs/:designId/get_cache_versions`).post(wwmt.verifyWwServiceToken, designVersionCtrl.getCacheVersions)

    app.route(`${utils.getServerPath()}/microservice/designs/:designId/domain`)
        .get(wwmt.verifyWwServiceToken, designVersionCtrl.getDomain)
        .post(wwmt.verifyWwServiceToken, designVersionCtrl.updateDomain)

    app.route(`${utils.getServerPath()}/admin/designs/:designId/previews`).get(designVersionCtrl.getAllRoutes)
    app.route(`${utils.getServerPath()}/microservice/projects/:projectId/versions/:version/config`).get(wwmt.verifyWwServiceToken, designVersionCtrl.getConfig)
    app.route(`${utils.getServerPath()}/public/v1/projects/:projectId/versions` as string).get(
        publicAccessMdlw.ensurePublicAccess,
        designVersionCtrl.publicGetVersions
    )
    app.route(`${utils.getServerPath()}/public/v1/projects/:projectId/versions/:version/active` as string).post(
        publicAccessMdlw.ensurePublicAccess,
        designVersionCtrl.publicSetVersionActive
    )
}
