import consola, { Consola } from "consola";
import { PoolOptions, Connection, createConnection, RowDataPacket, OkPacket, ResultSetHeader, FieldPacket, QueryError, Query } from "mysql2";
import { Pool } from "mysql2/promise";

const DEFAULT_TIDB_SERVER_PORT = '4000';

export function getConnectionOptions(options?: PoolOptions) {
    if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL.length === 0) {
        consola.error('Must provide DATABASE_URL in the env variable.');
        process.exit();
    }

    const url = new URL(process.env.DATABASE_URL);
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

export interface QueryResponse<T> {
    result: T;
    fields: FieldPacket[];
}

export class ConnectionWrapper {
    public conn: Connection;
    private log: Consola;

    constructor(options: PoolOptions) {
        this.log = consola.withTag('db-conn');
        this.conn = createConnection(options);
        const errorHandler = (err: any) => {
            if (!err.fatal) return;
            if (err.code !== 'PROTOCOL_CONNECTION_LOST') throw err;

            this.log.warn(`Database server connection lost, trying to reconnect.`);
            const newConn = createConnection(this.conn.config);
            newConn.connect();
            newConn.on('error', errorHandler);
            this.conn = newConn;
        }
        this.conn.on('error', errorHandler);
    }

    query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        sql: string,
        values: any | any[] | { [param: string]: any }
    ): Promise<QueryResponse<T>> {
        return new Promise((resolve, reject) => {
            this.conn.query<T>(sql, values, (err: QueryError | null, result, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        result, fields
                    });
                }
            });
        });
    }
    
    execute<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        sql: string,
    ): Promise<QueryResponse<T>>;

    execute<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        sql: string,
        values: any | any[] | { [param: string]: any }
    ): Promise<QueryResponse<T>>;

    execute<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        sql: string,
        values?: any | any[] | { [param: string]: any }
    ): Promise<QueryResponse<T>> {
        if (values === undefined) {
            values = [];
        }

        return new Promise((resolve, reject) => {
            this.conn.execute<T>(sql, values, (err: QueryError | null, result, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        result, fields
                    });
                }
            });
        });
    }


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
