'use strict'
import { utils } from '../services'

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
                schema: utils.getDatabaseSchema(),
            }
        )
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('cmsDataSets', 'type', {
            schema: utils.getDatabaseSchema(),
        })
    },
}
