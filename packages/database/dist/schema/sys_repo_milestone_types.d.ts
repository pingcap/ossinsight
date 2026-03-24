/**
 * sys_repo_milestone_types schema
 */
export declare const sysRepoMilestoneTypes: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "sys_repo_milestone_types";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "sys_repo_milestone_types";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "name";
            tableName: "sys_repo_milestone_types";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
export type SysRepoMilestoneTypes = typeof sysRepoMilestoneTypes.$inferSelect;
export type NewSysRepoMilestoneTypes = typeof sysRepoMilestoneTypes.$inferInsert;
//# sourceMappingURL=sys_repo_milestone_types.d.ts.map