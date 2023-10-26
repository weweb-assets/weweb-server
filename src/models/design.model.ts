import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize'

/**
 * @export
 * @interface Design
 */
export interface Design {
    readonly id: string
    designId: string
    name: string
    stagingName: string
    sitemapXml: string
    robotsTxt: string
    readonly createdAt: Date
    readonly updatedAt: Date
}

/**
 * @export
 * @interface DesignModel
 * @extends {Design}
 * @extends {Model}
 */
export interface DesignModel extends Design, Model {
    getInfo(): any
}

export type DesignStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): DesignModel
    associate(_models: [Model]): void
}

export const init = (sequelize: Sequelize): DesignStatic => {
    /*=============================================m_ÔÔ_m=============================================\
        Model definition
    \================================================================================================*/
    const model = sequelize.define(
        'design',
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
            stagingName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            sitemapXml: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            robotsTxt: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            indexes: [
                { name: 'designs_designId_idx', using: 'BTREE', fields: ['designId'] },
                { name: 'designs_name_idx', using: 'BTREE', fields: ['name'] },
            ],
        }
    ) as DesignStatic

    /*=============================================m_ÔÔ_m=============================================\
        Instance methods
    \================================================================================================*/
    model.prototype.getInfo = function (): Design {
        return {
            id: this.id,
            designId: this.designId,
            name: this.name,
            stagingName: this.stagingName,
            sitemapXml: this.sitemapXml,
            robotsTxt: this.robotsTxt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }

    /*=============================================m_ÔÔ_m=============================================\
        Hooks
    \================================================================================================*/

    return model
}
