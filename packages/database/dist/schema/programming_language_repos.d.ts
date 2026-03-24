/**
 * programming_language_repos schema
 */
export declare const programmingLanguageRepos: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "programming_language_repos";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "programming_language_repos";
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
            tableName: "programming_language_repos";
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
export type ProgrammingLanguageRepos = typeof programmingLanguageRepos.$inferSelect;
export type NewProgrammingLanguageRepos = typeof programmingLanguageRepos.$inferInsert;
//# sourceMappingURL=programming_language_repos.d.ts.map