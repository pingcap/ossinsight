/**
 * github_events schema
 *
 * Migrated from: packages/api-server/__tests__/migrations/gharchive_dev.github_events-schema.sql
 */
export declare const githubEvents: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "github_events";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        type: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "type";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "created_at";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        repo_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repo_id";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        repo_name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repo_name";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        actor_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "actor_id";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        actor_login: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "actor_login";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        language: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "language";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        additions: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "additions";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        deletions: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "deletions";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        action: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "action";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        number: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "number";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        commit_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "commit_id";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        comment_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "comment_id";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        org_login: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "org_login";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        org_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "org_id";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        state: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "state";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        closed_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "closed_at";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        comments: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "comments";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        pr_merged_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "pr_merged_at";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        pr_merged: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "pr_merged";
            tableName: "github_events";
            dataType: "boolean";
            columnType: "MySqlBoolean";
            data: boolean;
            driverParam: number | boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        pr_changed_files: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "pr_changed_files";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        pr_review_comments: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "pr_review_comments";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        pr_or_issue_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "pr_or_issue_id";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        event_day: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "event_day";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlDateString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        event_month: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "event_month";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlDateString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        event_year: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "event_year";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        push_size: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "push_size";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        push_distinct_size: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "push_distinct_size";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        creator_user_login: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "creator_user_login";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        creator_user_id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "creator_user_id";
            tableName: "github_events";
            dataType: "number";
            columnType: "MySqlBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        pr_or_issue_created_at: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "pr_or_issue_created_at";
            tableName: "github_events";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type GithubEvent = typeof githubEvents.$inferSelect;
export type NewGithubEvent = typeof githubEvents.$inferInsert;
//# sourceMappingURL=github_events.d.ts.map