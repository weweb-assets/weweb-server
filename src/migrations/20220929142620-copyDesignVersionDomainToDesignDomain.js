'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return migrate(queryInterface, Sequelize)
    },

    down: (queryInterface, Sequelize) => {},
}

async function migrate(queryInterface, Sequelize) {
    const [designVersions] = await queryInterface.sequelize.query(
        `SELECT "designId", "domain", "createdAt" FROM "${
            process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public'
        }"."designVersions" ORDER BY "createdAt" DESC`
    )

    const designVersionDone = []
    const newDomains = []
    for (const designVersion of designVersions) {
        if (designVersionDone.indexOf(designVersion.designId) === -1) {
            designVersionDone.push(designVersion.designId)
            newDomains.push({
                id: designVersion.designId,
                designId: designVersion.designId,
                name: designVersion.domain,
                createdAt: designVersion.createdAt,
                updatedAt: designVersion.createdAt,
            })
        }
    }

    await queryInterface.bulkInsert({ tableName: 'designDomains', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, newDomains, {})

    queryInterface.removeColumn({ tableName: 'designVersions', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'domain')
}
