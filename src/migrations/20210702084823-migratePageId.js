'use strict'
import { utils } from '../services'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return migrate(queryInterface, Sequelize)
    },

    down: (queryInterface, Sequelize) => {},
}

async function migrate(queryInterface, Sequelize) {
    queryInterface.addColumn(
        'pages',
        'pageId',
        {
            type: Sequelize.UUID,
            allowNull: true,
        },
        {
            schema: utils.getDatabaseSchema(),
        }
    )
    const [pages] = await queryInterface.sequelize.query(`SELECT "id" FROM "${utils.getDatabaseSchema()}"."pages"`)

    for (const page of pages) {
        await queryInterface.bulkUpdate(
            'pages',
            { pageId: page.id },
            { id: page.id },
            {
                schema: utils.getDatabaseSchema(),
            }
        )
    }

    queryInterface.changeColumn(
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
}
