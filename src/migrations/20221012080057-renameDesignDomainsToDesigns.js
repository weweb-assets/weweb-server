'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.renameTable({ tableName: 'designDomains', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'designs')
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    },
}
