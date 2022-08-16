import { createConnection, createPool } from "mysql2";
import { PoolOptions } from "mysql2/typings/mysql";

const DEFAULT_TIDB_SERVER_PORT = '4000';

export function getConnectionOptions(options?: PoolOptions) {
    const defaultOptions = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || DEFAULT_TIDB_SERVER_PORT),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        decimalNumbers: true,
        timezone: 'Z'
    };
    return Object.assign(defaultOptions, options);
}
