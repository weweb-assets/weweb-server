import { Model, ModelCtor, Sequelize } from 'sequelize'
import * as models from '../models'
import { log } from '../services'
import fs from 'fs'
import { db } from '.'

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

        this.importConfig()

        // try {
        //     /* istanbul ignore if */
        //     if (process.env.NODE_ENV === 'production') return
        //     await this.sync({ force: false, logging: false, hooks: false })
        // } catch (err) /* istanbul ignore next */ {
        //     return log.error(err)
        // }
    }

    /**
     * Import config.
     * @memberof PostgreSQL
     */
    public async importConfig() {
        if (!fs.existsSync('./weweb-server.config.json')) return

        const config = JSON.parse(fs.readFileSync('./weweb-server.config.json', 'utf8'))
        const pagesMap = {} as any

        const designVersion = await db.models.designVersion.create({ ...config, id: undefined, activeProd: false, activeStaging: false })

        const [design] = await db.models.design.findOrCreate({
            where: { designId: config.design.id },
            defaults: { designId: config.design.id },
        })
        await design.update({ name: config.design.name || design.name, stagingName: config.design.stagingName || design.stagingName })

        for (const cmsDataSet of config.cmsDataSets) {
            await db.models.cmsDataSet.create({ ...cmsDataSet, designVersionId: designVersion.id, id: undefined })
        }
        for (const page of config.pages) {
            const { id } = await db.models.page.create({ ...page, designVersionId: designVersion.id, id: undefined })
            pagesMap[page.id] = id
        }
        for (const pluginSetting of config.pluginSettings) {
            await db.models.pluginSettings.create({ ...pluginSetting, designVersionId: designVersion.id, id: undefined })
        }
        for (const redirection of config.redirections) {
            await db.models.redirection.create({ ...redirection, designVersionId: designVersion.id, pageId: pagesMap[redirection.pageId], id: undefined })
        }

        await db.models.designVersion.update({ activeProd: false }, { where: { designId: config.designId, activeProd: true } })

        await designVersion.update({ activeProd: true })
    }
}
