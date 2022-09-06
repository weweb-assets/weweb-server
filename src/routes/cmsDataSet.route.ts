import { Application } from 'express'
import { website as websiteMdwl } from '../middlewares'
import { cmsDataSet as cmsDataSetCtrl } from '../controllers'
const wwmt = require('weweb-microservice-token')

/*=============================================m_ÔÔ_m=============================================\
    Plugin Settings Route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${process.env.SERVER_PATH}/microservice/designs/:designId/versions/:designVersionId/cms_data_sets` as string).post(
        wwmt.verifyWwServiceToken,
        cmsDataSetCtrl.createCmsDataSet
    )
    app.route(`${process.env.SERVER_PATH}/ww/cms_data_sets/:cmsDataSetId/fetch` as string).post(websiteMdwl.ensureWebsite, cmsDataSetCtrl.fetchCmsDataSet)
    app.route(`${process.env.SERVER_PATH}/ww/cms_data_sets/:cmsDataSetId/airtable/record` as string).post(websiteMdwl.ensureWebsite, cmsDataSetCtrl.createAirtableRecord)
    app.route(`${process.env.SERVER_PATH}/ww/cms_data_sets/:cmsDataSetId/airtable/record/:recordId` as string)
        .patch(websiteMdwl.ensureWebsite, cmsDataSetCtrl.updateAirtableRecord)
        .delete(websiteMdwl.ensureWebsite, cmsDataSetCtrl.deleteAirtableRecord)
}
