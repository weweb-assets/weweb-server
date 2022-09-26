'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'cmsDataSets',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                    unique: true,
                },
                cmsDataSetId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                designVersionId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'designVersions',
                            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                        },
                        key: 'id',
                    },
                },
                settingsId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'pluginSettings',
                            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
                        },
                        key: 'id',
                    },
                },
                pluginId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                config: {
                    type: Sequelize.JSONB,
                    allowNull: true,
                },
                limit: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
                type: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: 'single',
                    validate: {
                        isIn: [['collection', 'single']],
                    },
                },
                mode: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: 'static',
                    validate: {
                        isIn: [['static', 'cached', 'dynamic']],
                    },
                },
                filter: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: {},
                },
                sort: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: [],
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
            }
        )
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('cmsDataSets', {
            schema: process.env.RDS_SCHEMA || process.env.DB_SCHEMA || 'public',
        })
    },
}
