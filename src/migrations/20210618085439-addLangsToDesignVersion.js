'use strict'
import { utils } from '../services'

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
                schema: utils.getDatabaseSchema(),
            }
        )
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('designVersions', 'langs', {
            schema: utils.getDatabaseSchema(),
        })
    },
}
