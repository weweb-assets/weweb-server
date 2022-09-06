'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('designVersions', 'langs', {
            type: Sequelize.JSONB,
            allowNull: true,
        })
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('designVersions', 'langs')
    },
}
