'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'cmsDataSets',
            'type',
            {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'single',
                validate: {
                    isIn: [['collection', 'single']],
                },
            },
            {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }
        )
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('cmsDataSets', 'type', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
