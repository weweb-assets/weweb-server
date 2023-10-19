'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.addIndex('pageMetadata', ['designId', 'path'], {
            name: 'pageMetadata_designId_path_idx',
            using: 'BTREE',
            unique: true,
        })
    },
    down: async (queryInterface, Sequelize) => {
        return queryInterface.removeIndex('pageMetadata', 'pageMetadata_designId_path_idx')
    },
}
