'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                'pages',
                'userGroups',
                {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: [],
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.removeColumn('pages', 'isPrivate', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
        ])
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('pages', 'userGroups', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
