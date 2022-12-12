'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn({ tableName: 'designs', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'stagingName', {
            type: Sequelize.STRING,
        })
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
