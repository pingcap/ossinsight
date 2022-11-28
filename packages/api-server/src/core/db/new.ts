import {Connection, ConnectionOptions, createConnection, createPool, Pool, PoolOptions} from "mysql2/promise";

// Notice: If you provide connection information via `option.uri`, the options provided in uri
// **cannot** override the default options below
// Link: https://github.com/sidorares/node-mysql2/blob/67a18010dcffd793b9783657628b9b9ba39cc717/lib/connection_config.js#L74
const defaultConnectionOptions = {
    decimalNumbers: true,
    timezone: 'Z'
}

export function checkIfTestDatabaseIsLocal(options: ConnectionOptions) {
    let dsn = options.uri;
    if (!dsn) {
        dsn = `mysql://${options.user}:${options.password}@${options.host}:${options.port}/${options.database}`;
    }
    const matchLocalAddress = /(localhost)|(127\.0\.0\.1)/.test(dsn);
    if (process.env.NODE_ENV === 'test' && !matchLocalAddress) {
        throw new Error('Must use local database for test.');
    }
}

export function getConnectionOptions(options: ConnectionOptions): ConnectionOptions {
    checkIfTestDatabaseIsLocal(options);
    return Object.assign({}, defaultConnectionOptions, options);
}

export function getPoolOptions(options: PoolOptions): PoolOptions {
    checkIfTestDatabaseIsLocal(options);
    return Object.assign({}, defaultConnectionOptions, options);
}

export function getConnection(extraOptions: ConnectionOptions): Promise<Connection> {
    return createConnection(getConnectionOptions(extraOptions));
}

export function getPool(extraOptions: PoolOptions): Pool {
    return createPool(getPoolOptions(extraOptions));
}

