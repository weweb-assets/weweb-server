'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return migrate(queryInterface, Sequelize)
    },

    down: (queryInterface, Sequelize) => {},
}

async function migrate(queryInterface, Sequelize) {
    queryInterface.addColumn('pages', 'pageId', {
        type: Sequelize.UUID,
        allowNull: true,
    })
    const [pages] = await queryInterface.sequelize.query('SELECT "id" FROM "public"."pages"')

    for (const page of pages) {
        await queryInterface.bulkUpdate('pages', { pageId: page.id }, { id: page.id })
    }

    queryInterface.changeColumn('pages', 'pageId', {
        type: Sequelize.UUID,
        allowNull: false,
    })
}
