/**
 * sys_repo_milestones schema
 */
export declare const sysRepoMilestones: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "sys_repo_milestones";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "sys_repo_milestones";
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
            tableName: "sys_repo_milestones";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        milestoneTypeId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "milestoneTypeId";
            tableName: "sys_repo_milestones";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        milestoneNumber: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "milestoneNumber";
            tableName: "sys_repo_milestones";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        payload: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "payload";
            tableName: "sys_repo_milestones";
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        reachedAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "reachedAt";
            tableName: "sys_repo_milestones";
            dataType: "string";
            columnType: "MySqlDateTimeString";
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
export type SysRepoMilestones = typeof sysRepoMilestones.$inferSelect;
export type NewSysRepoMilestones = typeof sysRepoMilestones.$inferInsert;
//# sourceMappingURL=sys_repo_milestones.d.ts.map