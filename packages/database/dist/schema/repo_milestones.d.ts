/**
 * repo_milestones schema
 */
export declare const repoMilestones: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "repo_milestones";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "repo_milestones";
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
            tableName: "repo_milestones";
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
            tableName: "repo_milestones";
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
            tableName: "repo_milestones";
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
            tableName: "repo_milestones";
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        createdAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "createdAt";
            tableName: "repo_milestones";
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
export type RepoMilestones = typeof repoMilestones.$inferSelect;
export type NewRepoMilestones = typeof repoMilestones.$inferInsert;
//# sourceMappingURL=repo_milestones.d.ts.map