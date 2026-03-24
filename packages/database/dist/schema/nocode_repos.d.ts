/**
 * nocode_repos schema
 */
export declare const nocodeRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "nocode_repos";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "nocode_repos";
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
            tableName: "nocode_repos";
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
export type NocodeRepos = typeof nocodeRepos.$inferSelect;
export type NewNocodeRepos = typeof nocodeRepos.$inferInsert;
//# sourceMappingURL=nocode_repos.d.ts.map