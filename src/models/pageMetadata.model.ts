import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'
import { ModelsList } from '../core/database.core'

/**
 * @export
 * @interface PageMetadata
 */
export interface PageMetadata {
    path: string
    designId: string
    metadata: any
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface PageMetadataModel
 * @extends {PageMetadata}
 * @extends {Model}
 */
export interface PageMetadataModel extends PageMetadata, Model {
    getInfo(): any
}

export type PageMetadataStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): PageMetadataModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): PageMetadataStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define(
        'pageMetadata',
        {
            path: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            designId: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
            },
            metadata: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {},
            },
        },
        { indexes: [{ name: 'pageMetadata_designId_path_idx', using: 'BTREE', fields: ['designId', 'path'], unique: true }] }
    ) as PageMetadataStatic

    /*=============================================m_ÔÔ_m=============================================\
        Class methods
    \================================================================================================*/
    model.associate = function (models: ModelsList) {
        model.belongsTo(models.design, {
            foreignKey: 'designId',
        })
    }

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): PageMetadata {
        return {
            path: this.path,
            designId: this.designId,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    return model
}
