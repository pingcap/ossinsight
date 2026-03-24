/**
 * sys_subscribed_repos schema
 */
export declare const sysSubscribedRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "sys_subscribed_repos";
    schema: undefined;
    columns: {
        userId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "userId";
            tableName: "sys_subscribed_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        repoId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoId";
            tableName: "sys_subscribed_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        subscribedAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "subscribedAt";
            tableName: "sys_subscribed_repos";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        subscribed: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "subscribed";
            tableName: "sys_subscribed_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        fkSsrOnUserId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "fkSsrOnUserId";
            tableName: "sys_subscribed_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        fkSsrOnRepoId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "fkSsrOnRepoId";
            tableName: "sys_subscribed_repos";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type SysSubscribedRepos = typeof sysSubscribedRepos.$inferSelect;
export type NewSysSubscribedRepos = typeof sysSubscribedRepos.$inferInsert;
//# sourceMappingURL=sys_subscribed_repos.d.ts.map