/**
 * static_site_generator_repos schema
 */
export declare const staticSiteGeneratorRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "static_site_generator_repos";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "static_site_generator_repos";
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
            tableName: "static_site_generator_repos";
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
export type StaticSiteGeneratorRepos = typeof staticSiteGeneratorRepos.$inferSelect;
export type NewStaticSiteGeneratorRepos = typeof staticSiteGeneratorRepos.$inferInsert;
//# sourceMappingURL=static_site_generator_repos.d.ts.map