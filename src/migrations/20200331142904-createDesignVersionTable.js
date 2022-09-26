'use strict'
import { utils } from '../services'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'designVersions',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                    unique: true,
                },
                designId: {
                    type: Sequelize.UUID,
                    allowNull: false,
                },
                domain: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                cacheVersion: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                homePageId: {
                    type: Sequelize.UUID,
                    allowNull: true,
                },
                isActive: {
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
        return queryInterface.dropTable('designVersions', {
            schema: utils.getDatabaseSchema(),
        })
    },
}
