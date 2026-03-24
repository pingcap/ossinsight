/**
 * github_users schema
 */
import { mysqlTable, varchar, boolean, timestamp, index, } from 'drizzle-orm/mysql-core';
export const githubUsers = mysqlTable('github_users', {
    id: varchar('id', { length: 11 }).primaryKey(),
    login: varchar('login', { length: 255 }),
    type: varchar('type', { length: 3 }),
    is_bot: boolean('isBot'),
    name: varchar('name', { length: 255 }),
    email: varchar('email', { length: 255 }),
    organization: varchar('organization', { length: 255 }).notNull(),
    organization_formatted: varchar('organizationFormatted', { length: 255 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    country_code: varchar('countryCode', { length: 3 }),
    region_code: varchar('regionCode', { length: 3 }),
    state: varchar('state', { length: 255 }),
    city: varchar('city', { length: 255 }),
    longitude: varchar('longitude', { length: 255 }),
    latitude: varchar('latitude', { length: 255 }),
    public_repos: varchar('publicRepos', { length: 11 }),
    stars_total: varchar('starsTotal', { length: 11 }),
    participant_total: varchar('participantTotal', { length: 11 }),
    followers: varchar('followers', { length: 11 }),
    followings: varchar('followings', { length: 11 }),
    created_at: timestamp('createdAt', { mode: 'string', fsp: 3 }),
    updated_at: timestamp('updatedAt', { mode: 'string', fsp: 3 }),
    is_deleted: boolean('isDeleted'),
    refreshed_at: timestamp('refreshedAt', { mode: 'string', fsp: 3 }),
}, (table) => ({
    index_gu_on_login_is_bot_organization_country_code: index('index_gu_on_login_is_bot_organization_country_code').on(table.login, table.is_bot, table.organization_formatted, table.country_code),
    index_gu_on_address: index('index_gu_on_address').on(table.address),
    index_gu_on_organization: index('index_gu_on_organization').on(table.organization),
}));
//# sourceMappingURL=github_users.js.map