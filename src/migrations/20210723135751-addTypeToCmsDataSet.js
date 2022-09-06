'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('cmsDataSets', 'type', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'single',
            validate: {
                isIn: [['collection', 'single']],
            },
        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('cmsDataSets', 'type')
    },
}
