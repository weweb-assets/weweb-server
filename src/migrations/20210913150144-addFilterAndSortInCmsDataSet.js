'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('cmsDataSets', 'filter', {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {},
            }),
            queryInterface.addColumn('cmsDataSets', 'sort', {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: [],
            }),
        ])
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([queryInterface.removeColumn('cmsDataSets', 'filter'), queryInterface.removeColumn('cmsDataSets', 'sort')])
    },
}
