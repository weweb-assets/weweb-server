'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn('pages', 'pageId', {
            type: Sequelize.STRING,
            allowNull: false,
        })
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn('pages', 'pageId', {
            type: Sequelize.UUID,
            allowNull: false,
        })
    },
}
