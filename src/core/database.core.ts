import { Model, ModelCtor, Sequelize } from 'sequelize'
import * as models from '../models'
import { log } from '../services'

/**
 * @interface ModelsList
 */
export interface ModelsList {
    [key: string]: ModelCtor<Model<any, any>> | any
}

/**
 * Database core.
 * @export
 * @class PostgreSQL
 * @extends {Sequelize}
 */
export default class PostgreSQL extends Sequelize {
    public models: models.models

    /**
     * Creates an instance of PostgreSQL.
     * @param {string} dbname
     * @param {string} username
     * @param {string} password
     * @param {string} hostname
     * @memberof PostgreSQL
     */
    constructor(dbname: string, username: string, password: string, hostname: string, port: number, schema: string, useSSL: boolean) {
        super(dbname, username, password, {
            host: hostname,
            dialect: 'postgres',
            protocol: 'postgres',
            logging: false,
            port: port || 5432,
            schema,
            dialectOptions: {
                ssl: !!useSSL ? { require: true, rejectUnauthorized: false } : false,
            },
        })
    }

    /**
     * Imports all models
     * @private
     * @memberof PostgreSQL
     */
    private importModels() {
        models.default(this)
    }

    /**
     * Associate each model.
     * @private
     * @memberof PostgreSQL
     */
    private associateModels() {
        const models = this.models as ModelsList
        Object.keys(models).forEach(modelName => {
            /* istanbul ignore next */
            if (typeof models[modelName].associate === 'function') models[modelName].associate(models)
        })
    }

    /**
     * Run the database.
     * @memberof PostgreSQL
     */
    public async run() {
        this.importModels()
        this.associateModels()

        try {
            await this.authenticate()
            log.info('Database successfully connected')
        } catch (err) /* istanbul ignore next */ {
            return log.error(err)
        }

        // try {
        //     /* istanbul ignore if */
        //     if (process.env.NODE_ENV === 'production') return
        //     await this.sync({ force: false, logging: false, hooks: false })
        // } catch (err) /* istanbul ignore next */ {
        //     return log.error(err)
        // }
    }
}
