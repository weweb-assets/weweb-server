import { Application } from 'express'
import * as middlewares from '../middlewares'
import * as controllers from '../controllers'
import { utils } from '../services'

/*=============================================m_ÔÔ_m=============================================\
    Template route
\================================================================================================*/
export default (app: Application) => {
    app.route(`${utils.getServerPath()}/template/:id*?`).get().post().patch().put().delete()
}
