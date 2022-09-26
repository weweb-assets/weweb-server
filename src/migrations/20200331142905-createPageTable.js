'use strict'
import { utils } from '../services'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'pages',
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
                paths: {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: {},
                },
                isPrivate: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
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
        return queryInterface.dropTable('pages', {
            schema: utils.getDatabaseSchema(),
        })
    },
}
