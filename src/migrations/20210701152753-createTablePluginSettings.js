'use strict'

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
                            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
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
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }
        )
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('pluginSettings', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
