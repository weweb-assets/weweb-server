'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'redirections',
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
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: {
                        model: {
                            tableName: 'pages',
                            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                        },
                        key: 'id',
                    },
                },
                urlSource: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                urlTarget: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                targetType: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
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
        return queryInterface.dropTable('redirections', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
