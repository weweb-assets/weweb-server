'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.addColumn({ tableName: 'designs', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'robotsTxt', {
            type: Sequelize.TEXT,
        })
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.removeColumn({ tableName: 'designs', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'robotsTxt')
    },
}
