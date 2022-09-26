'use strict'
import { utils } from '../services'

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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
                }
            ),
        ])
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('cmsDataSets', 'filter', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeColumn('cmsDataSets', 'sort', {
                schema: utils.getDatabaseSchema(),
            }),
        ])
    },
}
