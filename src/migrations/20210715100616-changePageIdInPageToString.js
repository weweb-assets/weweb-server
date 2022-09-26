'use strict'
import { utils } from '../services'

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
                schema: utils.getDatabaseSchema(),
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
                schema: utils.getDatabaseSchema(),
            }
        )
    },
}
