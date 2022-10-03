'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'designDomains',
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
                name: {
                    type: Sequelize.STRING,
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
        return queryInterface.dropTable('designDomains', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
