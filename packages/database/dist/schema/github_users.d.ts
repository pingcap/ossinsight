/**
 * github_users schema
 */
export declare const githubUsers: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "github_users";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        login: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "login";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        type: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "type";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        is_bot: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "isBot";
            tableName: "github_users";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "name";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        email: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "email";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        organization: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "organization";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        organization_formatted: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "organizationFormatted";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        address: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "address";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        country_code: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "countryCode";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        region_code: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "regionCode";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        state: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "state";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        city: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "city";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        longitude: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "longitude";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        latitude: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "latitude";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        public_repos: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "publicRepos";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        stars_total: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "starsTotal";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        participant_total: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "participantTotal";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        followers: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "followers";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        followings: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "followings";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "createdAt";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        updated_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "updatedAt";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        is_deleted: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "isDeleted";
            tableName: "github_users";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        refreshed_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "refreshedAt";
            tableName: "github_users";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type GithubUsers = typeof githubUsers.$inferSelect;
export type NewGithubUsers = typeof githubUsers.$inferInsert;
//# sourceMappingURL=github_users.d.ts.map