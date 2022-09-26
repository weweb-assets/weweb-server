'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'designVersions',
            'langs',
            {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }
        )
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('designVersions', 'langs', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
