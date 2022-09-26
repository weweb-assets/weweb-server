'use strict'
import { utils } from '../services'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'pluginSettings',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                    unique: true,
                },
                designVersionId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'designVersions',
                            schema: utils.getDatabaseSchema(),
                        },
                        key: 'id',
                    },
                },
                pluginId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                publicData: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: {},
                },
                privateData: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: {},
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                schema: utils.getDatabaseSchema(),
            }
        )
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('pluginSettings', {
            schema: utils.getDatabaseSchema(),
        })
    },
}
