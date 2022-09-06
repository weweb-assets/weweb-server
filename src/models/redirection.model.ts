import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'
import { ModelsList } from '../core/database.core'
import { page } from '.'

/**
 * @export
 * @interface Redirection
 */
export interface Redirection {
    readonly id: string
    designVersionId: string
    pageId: string
    urlSource: string
    urlTarget: string
    targetType: string
    status: string
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface RedirectionModel
 * @extends {Redirection}
 * @extends {Model}
 */
export interface RedirectionModel extends Redirection, Model {
    getInfo(): any
    page: page.Page
}

export type RedirectionStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): RedirectionModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): RedirectionStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define(
        'redirection',
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
            pageId: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            urlSource: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            urlTarget: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            targetType: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        { indexes: [{ name: 'redirections_designVersionId_urlSource_idx', using: 'BTREE', fields: ['designVersionId', 'urlSource'] }] }
    ) as RedirectionStatic

    /*=============================================m_ÔÔ_m=============================================\
        Class methods
    \================================================================================================*/
    model.associate = function (models: ModelsList) {
        model.belongsTo(models.designVersion, {
            foreignKey: 'designVersionId',
        })
        model.belongsTo(models.page, {
            foreignKey: 'pageId',
        })
    }

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): Redirection {
        return {
            id: this.id,
            designVersionId: this.designVersionId,
            pageId: this.pageId,
            urlSource: this.urlSource,
            urlTarget: this.urlTarget,
            targetType: this.targetType,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    /*=============================================m_ÔÔ_m=============================================\
        Hooks
    \================================================================================================*/

    return model
}
