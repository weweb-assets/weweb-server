'use strict'

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
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        }
    )
    const [pages] = await queryInterface.sequelize.query(`SELECT "id" FROM "${process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public'}"."pages"`)

    for (const page of pages) {
        await queryInterface.bulkUpdate(
            'pages',
            { pageId: page.id },
            { id: page.id },
            {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
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
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        }
    )
}
