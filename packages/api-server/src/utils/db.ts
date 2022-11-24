
import {ConnectionOptions, createConnection, Pool, PoolOptions} from "mysql2/promise";
import pino from "pino";

const DEFAULT_TIDB_SERVER_PORT = '4000';

export function getConnectionOptions(options?: PoolOptions | string): ConnectionOptions {
    let dsn = process.env.DATABASE_URL;
    if (typeof options === 'string') {
        dsn = options;
    }

    if (dsn === undefined || dsn.length === 0) {
        pino().error('Must provide DATABASE_URL in the env variable.');
        process.exit();
    }

    if (process.env.NODE_ENV === 'test' && (/tidb-cloud|gharchive_dev|github_events_api/.test(dsn))) {
        throw new Error('Do not use online database in test env.');
    }

    const url = new URL(dsn);
    const dbHost = url.hostname;
    const dbName = url.pathname.replaceAll('/', '');
    const dbPort = parseInt(url.port || DEFAULT_TIDB_SERVER_PORT);
    const dbUser = url.username;
    const dbPass = url.password;
    const defaultOptions = {
        host: dbHost,
        port: dbPort,
        database: dbName,
        user: dbUser,
        password: dbPass,
        decimalNumbers: true,
        timezone: 'Z'
    };    
    return Object.assign(defaultOptions, options);
}

export async function getConnection(options: ConnectionOptions, log: pino.Logger) {
    let conn = await createConnection(getConnectionOptions(options));
    const errorHandler = async (err: any) => {
        if (!err.fatal) return;
        if (err.code !== 'PROTOCOL_CONNECTION_LOST') throw err;

        log.warn(`Database server connection lost, trying to reconnect.`);
        const newConn = await createConnection(options);
        newConn.connect();
        await newConn.on('error', errorHandler);
        conn = newConn;
    }
    conn.on('error', errorHandler);
}

const INITIALIZED = Symbol('connection_initialized')

declare module 'mysql2/promise' {
    interface Connection {
        [INITIALIZED]?: true
    }
}

type DecoratePoolConnectionsOptions = {
    initialSql: string[];
}

// Notice: Why do we not use the connection event, but rewrite the getConnection method?
//
// The connection event will not block the getConnection procedure, which would lead to an incomplete initialization state.
export function decoratePoolConnections(pool: Pool, { initialSql }: DecoratePoolConnectionsOptions) {
    const originalGetConnection = pool.getConnection.bind(pool);
    pool.getConnection = async () => {
        const conn = await originalGetConnection();
        if (!conn[INITIALIZED]) {
            for (const sql of initialSql) {
                await conn.execute(sql);
            }

            Object.defineProperty(conn, INITIALIZED, {
                value: true,
                writable: false,
                configurable: false,
                enumerable: false,
            })
        }
        return conn;
    };
}
