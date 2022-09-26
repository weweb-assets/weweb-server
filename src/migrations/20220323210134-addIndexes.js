'use strict'
import { utils } from '../services'

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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
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
                    schema: utils.getDatabaseSchema(),
                }
            ),
        ])
    },
    down: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeIndex('designVersions', 'designVersions_designId_idx', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeIndex('designVersions', 'designVersions_designId_active_idx', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeIndex('designVersions', 'designVersions_domain_active_idx', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeIndex('cmsDataSets', 'cmsDataSets_designVersionId_cmsDataSetId_idx', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeIndex('pluginSettings', 'pluginSettings_designVersionId_idx', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeIndex('pages', 'pages_designVersionId_idx', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeIndex('pages', 'pages_designVersionId_pageId_idx', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeIndex('pages', 'pages_paths_idx', {
                schema: utils.getDatabaseSchema(),
            }),
            queryInterface.removeIndex('pages', 'redirections_designVersionId_urlSource_idx', {
                schema: utils.getDatabaseSchema(),
            }),
        ])
    },
}
