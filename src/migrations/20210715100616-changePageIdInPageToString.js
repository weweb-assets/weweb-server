'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn(
            'pages',
            'pageId',
            {
                type: Sequelize.STRING,
                allowNull: false,
            },
            {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }
        )
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn(
            'pages',
            'pageId',
            {
                type: Sequelize.UUID,
                allowNull: false,
            },
            {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }
        )
    },
}
