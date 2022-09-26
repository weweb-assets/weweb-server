'use strict'
import { utils } from '../services'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'redirections',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                    unique: true,
                },
                designVersionId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'designVersions',
                            schema: utils.getDatabaseSchema(),
                        },
                        key: 'id',
                    },
                },
                pageId: {
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: {
                        model: {
                            tableName: 'pages',
                            schema: utils.getDatabaseSchema(),
                        },
                        key: 'id',
                    },
                },
                urlSource: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                urlTarget: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                targetType: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
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
                schema: utils.getDatabaseSchema(),
            }
        )
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('redirections', {
            schema: utils.getDatabaseSchema(),
        })
    },
}
