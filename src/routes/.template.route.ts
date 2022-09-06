import { Application } from 'express'
import * as middlewares from '../middlewares'
import * as controllers from '../controllers'

/*=============================================m_ÔÔ_m=============================================\
    Template route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${process.env.SERVER_PATH}/template/:id*?`).get().post().patch().put().delete()
}
