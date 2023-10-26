'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameColumn('cmsDataSets', 'limit', 'limit_old')
        await queryInterface.addColumn('cmsDataSets', 'limit', {
            type: Sequelize.JSONB,
            allowNull: true,
        })
        await queryInterface.sequelize.query(`UPDATE "cmsDataSets" SET "limit" = to_jsonb(limit_old::text)::jsonb;`)
        await queryInterface.removeColumn('cmsDataSets', 'limit_old')
    },

    async down(queryInterface, Sequelize) {},
}
