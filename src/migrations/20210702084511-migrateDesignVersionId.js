'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return migrate(queryInterface, Sequelize)
    },

    down: (queryInterface, Sequelize) => {},
}

async function migrate(queryInterface, Sequelize) {
    queryInterface.addColumn('designVersions', 'designVersionId', {
        type: Sequelize.UUID,
        allowNull: true,
    })
    const [designVersions] = await queryInterface.sequelize.query('SELECT "id" FROM "public"."designVersions"')

    for (const designVersion of designVersions) {
        await queryInterface.bulkUpdate('designVersions', { designVersionId: designVersion.id }, { id: designVersion.id })
    }

    queryInterface.changeColumn('designVersions', 'designVersionId', {
        type: Sequelize.UUID,
        allowNull: false,
    })
}
