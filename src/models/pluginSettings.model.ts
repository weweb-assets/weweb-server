import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'
import { ModelsList } from '../core/database.core'

/**
 * @export
 * @interface PluginSettings
 */
export interface PluginSettings {
    readonly id: string
    designVersionId: string
    pluginId: string
    publicData: any
    privateData: any
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface PluginSettingsModel
 * @extends {PluginSettings}
 * @extends {Model}
 */
export interface PluginSettingsModel extends PluginSettings, Model {
    getInfo(): any
}

export type PluginSettingsStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): PluginSettingsModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): PluginSettingsStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define(
        'pluginSettings',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
                unique: true,
            },
            designVersionId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            pluginId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            publicData: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {},
            },
            privateData: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {},
            },
        },
        { indexes: [{ name: 'pluginSettings_designVersionId_pluginId_idx', using: 'BTREE', fields: ['designVersionId', 'pluginId'] }] }
    ) as PluginSettingsStatic

    /*=============================================m_ÔÔ_m=============================================\
        Class methods
    \================================================================================================*/
    model.associate = function (models: ModelsList) {
        model.belongsTo(models.designVersion, {
            foreignKey: 'designVersionId',
        })
        model.hasMany(models.cmsDataSet, {
            foreignKey: 'settingsId',
            constraints: true,
            onDelete: 'CASCADE',
            hooks: true,
        })
    }

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): PluginSettings {
        return {
            id: this.id,
            designVersionId: this.designVersionId,
            pluginId: this.pluginId,
            publicData: this.publicData,
            privateData: this.privateData,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    /*=============================================m_ÔÔ_m=============================================\
        Hooks
    \================================================================================================*/

    return model
}
