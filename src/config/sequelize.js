import { utils } from '../services'

module.exports = {
    development: {
        username: 'wwdb',
        password: 'wwpassword',
        database: 'wwpreview',
        host: 'postgres',
        port: '5432',
        dialect: 'postgres',
    },
    test: {
        username: 'wwdb',
        password: 'wwpassword',
        database: 'wwpreview',
        host: 'postgres',
        port: '5432',
        dialect: 'postgres',
    },
    production: {
        username: process.env.RDS_USERNAME || process.env.DB_USERNAME,
        password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD,
        database: process.env.RDS_DB_NAME || process.env.DB_NAME,
        host: process.env.RDS_HOSTNAME || process.env.DB_HOSTNAME,
        port: process.env.RDS_PORT || process.env.DB_PORT,
        schema: utils.getDatabaseSchema(),
        dialect: 'postgres',
        dialectOptions: {
            ssl: !!process.env.DB_SSL ? { require: true, rejectUnauthorized: false } : false,
        },
    },
}
