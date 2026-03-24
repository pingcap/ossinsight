/**
 * sys_sent_repo_milestones schema
 */
export declare const sysSentRepoMilestones: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "sys_sent_repo_milestones";
    schema: undefined;
    columns: {
        userId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "userId";
            tableName: "sys_sent_repo_milestones";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        repoMilestoneId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "repoMilestoneId";
            tableName: "sys_sent_repo_milestones";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        sentAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "sentAt";
            tableName: "sys_sent_repo_milestones";
            dataType: "string";
            columnType: "MySqlDateTimeString";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        sysSentRepoMilestonesUserIdFkey: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "sysSentRepoMilestonesUserIdFkey";
            tableName: "sys_sent_repo_milestones";
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
export type SysSentRepoMilestones = typeof sysSentRepoMilestones.$inferSelect;
export type NewSysSentRepoMilestones = typeof sysSentRepoMilestones.$inferInsert;
//# sourceMappingURL=sys_sent_repo_milestones.d.ts.map