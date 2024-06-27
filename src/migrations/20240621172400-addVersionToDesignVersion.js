'use strict'
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('designVersions', 'version', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        })
    },

    async down(queryInterface, Sequelize) {},
}
