'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        const TOKEN_BASED_AUTH = '41448d5d-ae26-49bd-82b6-1c79f462e972'
        const XANO_AUTH = 'f5856798-485d-47be-b433-d43d771c64e1'
        const OPENID = '01af5352-af71-4382-844b-2ec141ff243b'
        console.log('start')
        const [settings] = await queryInterface.sequelize.query(
            `SELECT * FROM "pluginSettings" WHERE "pluginId" IN ('${TOKEN_BASED_AUTH}','${XANO_AUTH}','${OPENID}');`
        )
        console.log('list')
        const transaction = await queryInterface.sequelize.transaction()

        try {
            for (const setting of settings) {
                console.log(setting.id)
                setting.publicData = {
                    ...setting.publicData,
                    ...(setting.privateData.roleKey ? { roleKey: setting.privateData.roleKey } : {}),
                    ...(setting.privateData.roleType ? { roleType: setting.privateData.roleType } : {}),
                    ...(setting.privateData.roleTypeKey ? { roleTypeKey: setting.privateData.roleTypeKey } : {}),
                    ...(setting.privateData.roles ? { roles: setting.privateData.roles } : {}),
                }
                delete setting.privateData.roleKey
                delete setting.privateData.roleType
                delete setting.privateData.roleTypeKey
                delete setting.privateData.roles

                setting.privateData = await queryInterface.sequelize.query(
                    `UPDATE "pluginSettings" SET "publicData" = :publicData, "privateData" = :privateData WHERE id = '${setting.id}';`,
                    {
                        replacements: { publicData: JSON.stringify(setting.publicData), privateData: JSON.stringify(setting.privateData) },
                        transaction,
                    }
                )
            }
            await transaction.commit()
        } catch (err) {
            await transaction.rollback()
            throw err
        }
    },

    async down(queryInterface, Sequelize) {},
}
