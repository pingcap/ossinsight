/**
 * blacklist_users schema
 */
export declare const blacklistUsers: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "blacklist_users";
    schema: undefined;
    columns: {
        login: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "login";
            tableName: "blacklist_users";
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
export type BlacklistUsers = typeof blacklistUsers.$inferSelect;
export type NewBlacklistUsers = typeof blacklistUsers.$inferInsert;
//# sourceMappingURL=blacklist_users.d.ts.map