'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'designVersions',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                    unique: true,
                },
                designId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                designVersionId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                domain: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                cacheVersion: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                homePageId: {
                    type: Sequelize.UUID,
                    allowNull: true,
                },
                langs: {
                    type: Sequelize.JSONB,
                    allowNull: true,
                },
                isActive: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
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
        return queryInterface.dropTable('designVersions', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
