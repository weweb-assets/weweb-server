'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                'cmsDataSets',
                'filter',
                {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: {},
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addColumn(
                'cmsDataSets',
                'sort',
                {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: [],
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
        ])
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('cmsDataSets', 'filter', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeColumn('cmsDataSets', 'sort', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
        ])
    },
}
