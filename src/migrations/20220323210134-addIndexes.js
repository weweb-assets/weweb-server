'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addIndex(
                'designVersions',
                ['designId'],
                {
                    name: 'designVersions_designId_idx',
                    using: 'BTREE',
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addIndex(
                'designVersions',
                ['designId', 'isActive'],
                {
                    name: 'designVersions_designId_active_idx',
                    using: 'BTREE',
                    where: { isActive: true },
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addIndex(
                'designVersions',
                ['domain', 'isActive'],
                {
                    name: 'designVersions_domain_active_idx',
                    using: 'BTREE',
                    where: { isActive: true },
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addIndex(
                'cmsDataSets',
                ['designVersionId', 'cmsDataSetId'],
                {
                    name: 'cmsDataSets_designVersionId_cmsDataSetId_idx',
                    using: 'BTREE',
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addIndex(
                'pluginSettings',
                ['designVersionId', 'pluginId'],
                {
                    name: 'pluginSettings_designVersionId_pluginId_idx',
                    using: 'BTREE',
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addIndex(
                'pages',
                ['designVersionId'],
                {
                    name: 'pages_designVersionId_idx',
                    using: 'BTREE',
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addIndex(
                'pages',
                ['designVersionId', 'pageId'],
                {
                    name: 'pages_designVersionId_pageId_idx',
                    using: 'BTREE',
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addIndex(
                'pages',
                ['paths'],
                {
                    name: 'pages_paths_idx',
                    using: 'GIN',
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
            queryInterface.addIndex(
                'redirections',
                ['designVersionId', 'urlSource'],
                {
                    name: 'redirections_designVersionId_urlSource_idx',
                    using: 'BTREE',
                },
                {
                    schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                }
            ),
        ])
    },
    down: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeIndex('designVersions', 'designVersions_designId_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeIndex('designVersions', 'designVersions_designId_active_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeIndex('designVersions', 'designVersions_domain_active_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeIndex('cmsDataSets', 'cmsDataSets_designVersionId_cmsDataSetId_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeIndex('pluginSettings', 'pluginSettings_designVersionId_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeIndex('pages', 'pages_designVersionId_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeIndex('pages', 'pages_designVersionId_pageId_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeIndex('pages', 'pages_paths_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
            queryInterface.removeIndex('pages', 'redirections_designVersionId_urlSource_idx', {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }),
        ])
    },
}
