import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'

/**
 * @export
 * @interface DesignDomain
 */
export interface DesignDomain {
    readonly id: string
    designId: string
    name: string
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface DesignDomainModel
 * @extends {DesignDomain}
 * @extends {Model}
 */
export interface DesignDomainModel extends DesignDomain, Model {
    getInfo(): any
}

export type DesignDomainStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): DesignDomainModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): DesignDomainStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define(
        'designDomain',
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
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            indexes: [
                { name: 'designDomains_designId_idx', using: 'BTREE', fields: ['designId'] },
                { name: 'designDomains_name_idx', using: 'BTREE', fields: ['name'] },
            ],
        }
    ) as DesignDomainStatic

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): DesignDomain {
        return {
            id: this.id,
            designId: this.designId,
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
