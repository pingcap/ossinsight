/**
 * web_framework_repos schema
 */
export declare const webFrameworkRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "web_framework_repos";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "web_framework_repos";
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
            tableName: "web_framework_repos";
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
export type WebFrameworkRepos = typeof webFrameworkRepos.$inferSelect;
export type NewWebFrameworkRepos = typeof webFrameworkRepos.$inferInsert;
//# sourceMappingURL=web_framework_repos.d.ts.map