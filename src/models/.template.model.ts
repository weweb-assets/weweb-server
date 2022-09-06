import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'

/**
 * @export
 * @interface Template
 */
export interface Template {
    readonly id: string
    name: string
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface TemplateModel
 * @extends {Template}
 * @extends {Model}
 */
export interface TemplateModel extends Template, Model {
    getInfo(): any
}

export type TemplateStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): TemplateModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): TemplateStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define('Template', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }) as TemplateStatic

    /*=============================================m_ÔÔ_m=============================================\
        Class methods
    \================================================================================================*/
    model.associate = function (_models: [Model]) {}

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): Template {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    /*=============================================m_ÔÔ_m=============================================\
        Hooks
    \================================================================================================*/

    return model
}
