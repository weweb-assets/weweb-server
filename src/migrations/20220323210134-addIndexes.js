'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        if ((process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public') === 'public') {
            return Promise.all([
                queryInterface.addIndex('designVersions', ['designId'], {
                    name: 'designVersions_designId_idx',
                    using: 'BTREE',
                }),
                queryInterface.addIndex('designVersions', ['designId', 'isActive'], {
                    name: 'designVersions_designId_active_idx',
                    using: 'BTREE',
                    where: { isActive: true },
                }),
                queryInterface.addIndex('designVersions', ['domain', 'isActive'], {
                    name: 'designVersions_domain_active_idx',
                    using: 'BTREE',
                    where: { isActive: true },
                }),
                queryInterface.addIndex('cmsDataSets', ['designVersionId', 'cmsDataSetId'], {
                    name: 'cmsDataSets_designVersionId_cmsDataSetId_idx',
                    using: 'BTREE',
                }),
                queryInterface.addIndex('pluginSettings', ['designVersionId', 'pluginId'], {
                    name: 'pluginSettings_designVersionId_pluginId_idx',
                    using: 'BTREE',
                }),
                queryInterface.addIndex('pages', ['designVersionId'], {
                    name: 'pages_designVersionId_idx',
                    using: 'BTREE',
                }),
                queryInterface.addIndex('pages', ['designVersionId', 'pageId'], {
                    name: 'pages_designVersionId_pageId_idx',
                    using: 'BTREE',
                }),
                queryInterface.addIndex('pages', ['paths'], {
                    name: 'pages_paths_idx',
                    using: 'GIN',
                }),
                queryInterface.addIndex('redirections', ['designVersionId', 'urlSource'], {
                    name: 'redirections_designVersionId_urlSource_idx',
                    using: 'BTREE',
                }),
            ])
        }
        return
    },
    down: async (queryInterface, Sequelize) => {
        if ((process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public') === 'public') {
            return Promise.all([
                queryInterface.removeIndex('designVersions', 'designVersions_designId_idx'),
                queryInterface.removeIndex('designVersions', 'designVersions_designId_active_idx'),
                queryInterface.removeIndex('designVersions', 'designVersions_domain_active_idx'),
                queryInterface.removeIndex('cmsDataSets', 'cmsDataSets_designVersionId_cmsDataSetId_idx'),
                queryInterface.removeIndex('pluginSettings', 'pluginSettings_designVersionId_idx'),
                queryInterface.removeIndex('pages', 'pages_designVersionId_idx'),
                queryInterface.removeIndex('pages', 'pages_designVersionId_pageId_idx'),
                queryInterface.removeIndex('pages', 'pages_paths_idx'),
                queryInterface.removeIndex('pages', 'redirections_designVersionId_urlSource_idx'),
            ])
        }
        return
    },
}
