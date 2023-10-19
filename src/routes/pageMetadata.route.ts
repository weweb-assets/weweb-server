import { Application } from 'express'
import { pageMetadata as pageMetadataCtrl } from '../controllers'
import { utils } from '../services'
import { publicAccess as publicAccessMdlw } from '../middlewares'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Page metadata Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/microservice/projects/:projectId/pages/metadata` as string)
        .get(wwmt.verifyWwServiceToken, pageMetadataCtrl.getAll)
        .post(wwmt.verifyWwServiceToken, pageMetadataCtrl.updateDesignVersionsUpdatedAt, pageMetadataCtrl.create)
        .patch(wwmt.verifyWwServiceToken, pageMetadataCtrl.updateDesignVersionsUpdatedAt, pageMetadataCtrl.update)
        .put(wwmt.verifyWwServiceToken, pageMetadataCtrl.updateDesignVersionsUpdatedAt, pageMetadataCtrl.createOrUpdate)
        .delete(wwmt.verifyWwServiceToken, pageMetadataCtrl.updateDesignVersionsUpdatedAt, pageMetadataCtrl.remove)
        

    //SITEMAP.XML
    app.route(`${utils.getServerPath()}/public/v1/projects/:projectId/sitemap_xml` as string)
        .post(publicAccessMdlw.ensurePublicAccess, pageMetadataCtrl.updateDesignVersionsUpdatedAt, pageMetadataCtrl.setSitemapXml)
        .get(publicAccessMdlw.ensurePublicAccess, pageMetadataCtrl.getSitemapXml)
    app.route(`${utils.getServerPath()}/microservice/projects/:projectId/sitemap_xml` as string)
        .post(wwmt.verifyWwServiceToken, pageMetadataCtrl.updateDesignVersionsUpdatedAt, pageMetadataCtrl.setSitemapXml)
        .get(wwmt.verifyWwServiceToken, pageMetadataCtrl.getSitemapXml)

    //ROBOTS.TXT
    app.route(`${utils.getServerPath()}/public/v1/projects/:projectId/robots_txt` as string)
        .post(publicAccessMdlw.ensurePublicAccess, pageMetadataCtrl.updateDesignVersionsUpdatedAt, pageMetadataCtrl.setRobotsTxt)
        .get(publicAccessMdlw.ensurePublicAccess, pageMetadataCtrl.getRobotsTxt)
    app.route(`${utils.getServerPath()}/microservice/projects/:projectId/robots_txt` as string)
        .post(wwmt.verifyWwServiceToken, pageMetadataCtrl.updateDesignVersionsUpdatedAt, pageMetadataCtrl.setRobotsTxt)
        .get(wwmt.verifyWwServiceToken, pageMetadataCtrl.getRobotsTxt)
}
