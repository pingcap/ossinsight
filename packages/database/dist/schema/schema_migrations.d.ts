/**
 * schema_migrations schema
 */
export declare const schemaMigrations: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "schema_migrations";
    schema: undefined;
    columns: {
        version: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "version";
            tableName: "schema_migrations";
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
export type SchemaMigrations = typeof schemaMigrations.$inferSelect;
export type NewSchemaMigrations = typeof schemaMigrations.$inferInsert;
//# sourceMappingURL=schema_migrations.d.ts.map