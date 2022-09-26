'use strict'

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
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        }
    )
    const [designVersions] = await queryInterface.sequelize.query(
        `SELECT "id" FROM "${process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public'}"."designVersions"`
    )

    for (const designVersion of designVersions) {
        await queryInterface.bulkUpdate(
            'designVersions',
            { designVersionId: designVersion.id },
            { id: designVersion.id },
            {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
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
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        }
    )
}
