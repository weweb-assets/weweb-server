'use strict'
const auth0 = require('auth0')
module.exports = {
    async up(queryInterface, Sequelize) {
        const AUTH0 = 'e93a2dfd-9b19-473e-b445-c666fed4e14a'
        console.log('start')
        const transaction = await queryInterface.sequelize.transaction()
        try {
            const [designVersions] = await queryInterface.sequelize.query(
                `SELECT "designVersions".id as "designVersionId", "pluginSettings".id as "pluginSettingId", "publicData", "privateData" FROM "designVersions" LEFT JOIN "pluginSettings" ON "designVersions".id = "pluginSettings"."designVersionId" WHERE "pluginId" = '${AUTH0}';`
            )
            // for each project
            for (const designVersion of designVersions) {
                // get all pages
                const [pages] = await queryInterface.sequelize.query(`SELECT * FROM "pages" WHERE "designVersionId" = '${designVersion.designVersionId}';`)
                if (!pages.some(page => page.userGroups.length > 1)) continue
                console.log('===== Design Version =====', designVersion.designVersionId)
                const management = new auth0.ManagementClient({
                    domain: designVersion.publicData.domain,
                    clientId: designVersion.publicData.M2MClientId,
                    clientSecret: designVersion.privateData.M2MClientSecret,
                    scope: 'read:roles',
                })
                const roles = await management.getRoles()
                // for each page
                for (const page of pages) {
                    console.log('==== page ==== ', page.id)
                    console.log(
                        'old userGroups',
                        page.userGroups.map(userGroup => userGroup?.roles)
                    )
                    const newUserGroups = page.userGroups.map(userGroup => {
                        if (!userGroup) return userGroup
                        return {
                            ...userGroup,
                            roles: userGroup.roles.map(({ value }) => {
                                const role = roles.find(role => role.id === value)
                                if (!role) return { value }
                                return {
                                    value: role.name,
                                }
                            }),
                        }
                    })
                    console.log(
                        'new userGroups',
                        newUserGroups.map(userGroup => userGroup?.roles)
                    )
                    // update page
                    await queryInterface.sequelize.query(`UPDATE "pages" SET "userGroups" = :userGroups WHERE id = '${page.id}';`, {
                        replacements: { userGroups: JSON.stringify(newUserGroups) },
                        transaction,
                    })
                }
            }

            await transaction.commit()
        } catch (err) {
            await transaction.rollback()
            throw err
        }
    },

    async down(queryInterface, Sequelize) {},
}
