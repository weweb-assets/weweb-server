import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'
import { ModelsList } from '../core/database.core'

/**
 * @export
 * @interface CmsDataSet
 */
export interface CmsDataSet {
    readonly id: string
    cmsDataSetId: string
    designVersionId: string
    settingsId: string
    pluginId: string
    type: string
    config: Object
    limit: number
    mode: string
    filter: Object
    sort: Object
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface CmsDataSetModel
 * @extends {CmsDataSet}
 * @extends {Model}
 */
export interface CmsDataSetModel extends CmsDataSet, Model {
    getInfo(): any
}

export type CmsDataSetStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): CmsDataSetModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): CmsDataSetStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define(
        'cmsDataSet',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
                unique: true,
            },
            cmsDataSetId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            designVersionId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            settingsId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            pluginId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'single',
                validate: {
                    isIn: [['collection', 'single']],
                },
            },
            config: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            limit: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            mode: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'static',
                validate: {
                    isIn: [['static', 'cached', 'dynamic']],
                },
            },
            filter: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {},
            },
            sort: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: [],
            },
        },
        { indexes: [{ name: 'cmsDataSets_designVersionId_cmsDataSetId_idx', using: 'BTREE', fields: ['designVersionId', 'cmsDataSetId'] }] }
    ) as CmsDataSetStatic

    /*=============================================m_ÔÔ_m=============================================\
        Class methods
    \================================================================================================*/
    model.associate = function (models: ModelsList) {
        model.belongsTo(models.designVersion, {
            foreignKey: 'designVersionId',
        })
        model.belongsTo(models.pluginSettings, {
            foreignKey: 'settingsId',
        })
    }

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): CmsDataSet {
        return {
            id: this.id,
            cmsDataSetId: this.cmsDataSetId,
            designVersionId: this.designVersionId,
            settingsId: this.settingsId,
            pluginId: this.pluginId,
            type: this.type,
            config: this.config,
            limit: this.limit,
            mode: this.mode,
            filter: this.filter,
            sort: this.sort,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    return model
}
