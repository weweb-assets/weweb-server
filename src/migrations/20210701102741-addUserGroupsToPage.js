'use strict'
import { utils } from '../services'

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
                    schema: utils.getDatabaseSchema(),
                }
            ),
            queryInterface.removeColumn('pages', 'isPrivate', {
                schema: utils.getDatabaseSchema(),
            }),
        ])
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('pages', 'userGroups', {
            schema: utils.getDatabaseSchema(),
        })
    },
}
