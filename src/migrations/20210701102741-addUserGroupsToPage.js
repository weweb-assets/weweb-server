'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('pages', 'userGroups', {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: [],
            }),
            queryInterface.removeColumn('pages', 'isPrivate'),
        ])
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('pages', 'userGroups')
    },
}
