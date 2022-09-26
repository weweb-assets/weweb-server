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
        'designVersions',
        'designVersionId',
        {
            type: Sequelize.UUID,
            allowNull: true,
        },
        {
            schema: utils.getDatabaseSchema(),
        }
    )
    const [designVersions] = await queryInterface.sequelize.query(`SELECT "id" FROM "${utils.getDatabaseSchema()}"."designVersions"`)

    for (const designVersion of designVersions) {
        await queryInterface.bulkUpdate(
            'designVersions',
            { designVersionId: designVersion.id },
            { id: designVersion.id },
            {
                schema: utils.getDatabaseSchema(),
            }
        )
    }

    queryInterface.changeColumn(
        'designVersions',
        'designVersionId',
        {
            type: Sequelize.UUID,
            allowNull: false,
        },
        {
            schema: utils.getDatabaseSchema(),
        }
    )
}
