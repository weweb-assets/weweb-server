'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.addColumn({ tableName: 'designVersions', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'isLimited', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        })
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.removeColumn({ tableName: 'designVersions', schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public' }, 'isLimited')
    },
}
