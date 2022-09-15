import { Application } from 'express'
import { website as websiteMdwl } from '../middlewares'
import { cmsDataSet as cmsDataSetCtrl } from '../controllers'
import { utils } from '../services'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Plugin Settings Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/microservice/designs/:designId/versions/:designVersionId/cms_data_sets` as string).post(
        wwmt.verifyWwServiceToken,
        cmsDataSetCtrl.createCmsDataSet
    )
    app.route(`${utils.getServerPath()}/ww/cms_data_sets/:cmsDataSetId/fetch` as string).post(websiteMdwl.ensureWebsite, cmsDataSetCtrl.fetchCmsDataSet)
    app.route(`${utils.getServerPath()}/ww/cms_data_sets/:cmsDataSetId/airtable/record` as string).post(
        websiteMdwl.ensureWebsite,
        cmsDataSetCtrl.createAirtableRecord
    )
    app.route(`${utils.getServerPath()}/ww/cms_data_sets/:cmsDataSetId/airtable/record/:recordId` as string)
        .patch(websiteMdwl.ensureWebsite, cmsDataSetCtrl.updateAirtableRecord)
        .delete(websiteMdwl.ensureWebsite, cmsDataSetCtrl.deleteAirtableRecord)
}
