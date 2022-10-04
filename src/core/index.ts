/*=============================================m_ÔÔ_m=============================================\
    Import Core
\================================================================================================*/
import App from './app.core'
import Database from './database.core'
import Server from './server.core'
import Website from './website.core'
import Auth0 from './auth0.core'
import AuthToken from './authToken.core'
import WeWebAuth from './wewebAuth.core'
import SupabaseAuth from './supabaseAuth.core'
import OpenId from './openId.core'

/*=============================================m_ÔÔ_m=============================================\
    Initialize Core
\================================================================================================*/
const app = new App()
const db = new Database(
    process.env.RDS_DB_NAME || process.env.DB_NAME,
    process.env.RDS_USERNAME || process.env.DB_USERNAME,
    process.env.RDS_PASSWORD || process.env.DB_PASSWORD,
    process.env.RDS_HOSTNAME || process.env.DB_HOSTNAME,
    parseInt(process.env.RDS_PORT || process.env.DB_PORT || '5432'),
    process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
    !!(process.env.RDS_SSL || process.env.DB_SSL)
)
const server = new Server(app.app)
const website = new Website()
const auth0 = new Auth0()
const authToken = new AuthToken()
const wewebAuth = new WeWebAuth()
const supabaseAuth = new SupabaseAuth()
const openId = new OpenId()

/*=============================================m_ÔÔ_m=============================================\
    Export Core
\================================================================================================*/
export { app, db, server, website, auth0, authToken, wewebAuth, supabaseAuth, openId }
