import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'
import { ModelsList } from '../core/database.core'

/**
 * @export
 * @interface DesignVersion
 */
export interface DesignVersion {
    readonly id: string
    designId: string
    designVersionId: string
    cacheVersion: number
    homePageId: string
    langs: Array<{
        lang: string
        default: boolean | null
        isDefaultPath: boolean | null
    }>
    activeProd: boolean
    activeStaging: boolean
    activeCheckpoint: boolean
    activeBackup: boolean
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface DesignVersionModel
 * @extends {DesignVersion}
 * @extends {Model}
 */
export interface DesignVersionModel extends DesignVersion, Model {
    getInfo(): any
}

export type DesignVersionStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): DesignVersionModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): DesignVersionStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define(
        'designVersion',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
                unique: true,
            },
            designId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            designVersionId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            cacheVersion: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            homePageId: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            langs: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            activeProd: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            activeStaging: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            activeCheckpoint: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            activeBackup: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            indexes: [
                { name: 'designVersions_designId_idx', using: 'BTREE', fields: ['designId'] },
                { name: 'designVersions_designId_active_prod_idx', using: 'BTREE', fields: ['designId', 'activeProd'], where: { activeProd: true } },
                { name: 'designVersions_designId_active_staging_idx', using: 'BTREE', fields: ['designId', 'activeStaging'], where: { activeStaging: true } },
            ],
        }
    ) as DesignVersionStatic

    /*=============================================m_ÔÔ_m=============================================\
        Class methods
    \================================================================================================*/
    model.associate = function (models: ModelsList) {
        model.hasMany(models.page, {
            foreignKey: 'designVersionId',
            constraints: true,
            onDelete: 'CASCADE',
            hooks: true,
        })
        model.hasMany(models.redirection, {
            foreignKey: 'designVersionId',
            constraints: true,
            onDelete: 'CASCADE',
            hooks: true,
        })
        model.hasMany(models.pluginSettings, {
            foreignKey: 'designVersionId',
            constraints: true,
            onDelete: 'CASCADE',
            hooks: true,
        })
        model.hasMany(models.cmsDataSet, {
            foreignKey: 'designVersionId',
            constraints: true,
            onDelete: 'CASCADE',
            hooks: true,
        })
    }

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): DesignVersion {
        return {
            id: this.id,
            designId: this.designId,
            designVersionId: this.designVersionId,
            cacheVersion: this.cacheVersion,
            homePageId: this.homePageId,
            activeProd: this.activeProd,
            activeStaging: this.activeStaging,
            activeCheckpoint: this.activeCheckpoint,
            activeBackup: this.activeBackup,
            langs: this.langs,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    /*=============================================m_ÔÔ_m=============================================\
        Hooks
    \================================================================================================*/

    return model
}
