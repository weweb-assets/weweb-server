module.exports = {
    development: {
        username: process.env.RDS_USERNAME || process.env.DB_USERNAME,
        password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD,
        database: process.env.RDS_DB_NAME || process.env.DB_NAME,
        host: process.env.RDS_HOSTNAME || process.env.DB_HOSTNAME || 'postgres',
        port: process.env.RDS_PORT || process.env.DB_PORT || '5432',
        schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        dialect: 'postgres',
        dialectOptions: {
            ssl: !!process.env.DB_SSL ? { require: true, rejectUnauthorized: false } : false,
        },
    },
    test: {
    },
    production: {
        username: process.env.RDS_USERNAME || process.env.DB_USERNAME,
        password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD || (process.env.RDS_CREDENTIALS ? JSON.parse(process.env.RDS_CREDENTIALS || "{}").password : undefined),
        database: process.env.RDS_DB_NAME || process.env.DB_NAME,
        host: process.env.RDS_HOSTNAME || process.env.DB_HOSTNAME,
        port: process.env.RDS_PORT || process.env.DB_PORT,
        schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        dialect: 'postgres',
        dialectOptions: {
            ssl: !!process.env.DB_SSL ? { require: true, rejectUnauthorized: false } : false,
        },
    },
}
