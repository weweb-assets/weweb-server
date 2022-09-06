'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('cmsDataSets', {
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
                        schema: 'public',
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
                        schema: 'public',
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
            mode: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'static',
                validate: {
                    isIn: [['static', 'cached', 'dynamic']],
                },
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('cmsDataSets')
    },
}
