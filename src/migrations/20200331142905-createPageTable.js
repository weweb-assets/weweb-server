'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'pages',
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
                pageId: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                paths: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: {},
                },
                userGroups: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: [],
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
        return queryInterface.dropTable('pages', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
