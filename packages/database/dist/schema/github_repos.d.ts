/**
 * github_repos schema
 */
export declare const githubRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "github_repos";
    schema: undefined;
    columns: {
        repo_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoId";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        repo_name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoName";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        owner_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "ownerId";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        owner_login: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "ownerLogin";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        owner_is_org: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "ownerIsOrg";
            tableName: "github_repos";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        description: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "description";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        primary_language: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "primaryLanguage";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        license: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "license";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        size: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "size";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        stars: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "stars";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        forks: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "forks";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        parent_repo_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "parentRepoId";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        is_fork: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "isFork";
            tableName: "github_repos";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        is_archived: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "isArchived";
            tableName: "github_repos";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        is_deleted: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "isDeleted";
            tableName: "github_repos";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        latest_released_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "latestReleasedAt";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        pushed_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "pushedAt";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "createdAt";
            tableName: "github_repos";
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
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        last_event_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "lastEventAt";
            tableName: "github_repos";
            dataType: "string";
            columnType: "MySqlTimestampString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        refreshed_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "refreshedAt";
            tableName: "github_repos";
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
export type GithubRepos = typeof githubRepos.$inferSelect;
export type NewGithubRepos = typeof githubRepos.$inferInsert;
//# sourceMappingURL=github_repos.d.ts.map