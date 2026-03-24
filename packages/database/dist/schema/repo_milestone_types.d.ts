/**
 * repo_milestone_types schema
 */
export declare const repoMilestoneTypes: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "repo_milestone_types";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "repo_milestone_types";
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
            tableName: "repo_milestone_types";
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
export type RepoMilestoneTypes = typeof repoMilestoneTypes.$inferSelect;
export type NewRepoMilestoneTypes = typeof repoMilestoneTypes.$inferInsert;
//# sourceMappingURL=repo_milestone_types.d.ts.map