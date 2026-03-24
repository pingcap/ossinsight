/**
 * sys_accounts schema
 */
export declare const sysAccounts: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "sys_accounts";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "sys_accounts";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        userId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "userId";
            tableName: "sys_accounts";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        provider: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "provider";
            tableName: "sys_accounts";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        providerAccountId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "providerAccountId";
            tableName: "sys_accounts";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        providerAccountLogin: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "providerAccountLogin";
            tableName: "sys_accounts";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        accessToken: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "accessToken";
            tableName: "sys_accounts";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        fkSaOnUserId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "fkSaOnUserId";
            tableName: "sys_accounts";
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
export type SysAccounts = typeof sysAccounts.$inferSelect;
export type NewSysAccounts = typeof sysAccounts.$inferInsert;
//# sourceMappingURL=sys_accounts.d.ts.map