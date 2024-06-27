'use strict'
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('designVersions', 'authPluginId', {
            type: Sequelize.UUID,
            allowNull: true,
        })
    },

    async down(queryInterface, Sequelize) {},
}
