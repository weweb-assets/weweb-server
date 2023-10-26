'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.addColumn({ tableName: 'designs', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'pagesMetadata', {
            type: Sequelize.JSONB,
            defaultValue: [],
        })
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.removeColumn({ tableName: 'designs', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'pagesMetadata')
    },
}
