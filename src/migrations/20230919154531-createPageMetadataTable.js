'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'pageMetadata',
            {
                path: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
                designId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'designs',
                            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                        },
                        key: 'id',
                    },
                    primaryKey: true,
                },
                metadata: {
                    type: Sequelize.JSONB,
                    allowNull: true,
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
        return queryInterface.dropTable('pageMetadata', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
