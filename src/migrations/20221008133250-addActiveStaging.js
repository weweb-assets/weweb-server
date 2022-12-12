'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.renameColumn(
                { tableName: 'designVersions', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' },
                'isActive',
                'activeProd'
            ),
            queryInterface.addColumn({ tableName: 'designVersions', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'activeStaging', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            }),
            queryInterface.addColumn({ tableName: 'designVersions', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'activeCheckpoint', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            }),
            queryInterface.addColumn({ tableName: 'designVersions', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'activeBackup', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            }),
        ])
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
