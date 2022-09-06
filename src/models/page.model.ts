import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'
import { ModelsList } from '../core/database.core'

/**
 * @export
 * @interface Page
 */
export interface Page {
    readonly id: string
    designVersionId: string
    pageId: string
    paths: {
        [key: string]: string | null
        default: string
    }
    userGroups: any
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface PageModel
 * @extends {Page}
 * @extends {Model}
 */
export interface PageModel extends Page, Model {
    getInfo(): any
}

export type PageStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): PageModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): PageStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define(
        'page',
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
                type: DataTypes.STRING,
                allowNull: false,
            },
            paths: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {},
            },
            userGroups: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: [],
            },
        },
        {
            indexes: [
                { name: 'pages_designVersionId_idx', using: 'BTREE', fields: ['designVersionId'] },
                { name: 'pages_designVersionId_pageId_idx', using: 'BTREE', fields: ['designVersionId', 'pageId'] },
                { name: 'pages_paths_idx', using: 'GIN', fields: ['paths'] },
            ],
        }
    ) as PageStatic

    /*=============================================m_ÔÔ_m=============================================\
        Class methods
    \================================================================================================*/
    model.associate = function (models: ModelsList) {
        model.belongsTo(models.designVersion, {
            foreignKey: 'designVersionId',
        })
        model.hasMany(models.redirection, {
            foreignKey: 'pageId',
            constraints: true,
            onDelete: 'CASCADE',
            hooks: true,
        })
    }

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): Page {
        return {
            id: this.id,
            designVersionId: this.designVersionId,
            pageId: this.pageId,
            paths: this.paths,
            userGroups: this.userGroups,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    /*=============================================m_ÔÔ_m=============================================\
        Hooks
    \================================================================================================*/

    return model
}
