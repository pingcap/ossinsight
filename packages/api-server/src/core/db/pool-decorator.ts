import {Pool} from "mysql2/promise";

/**
 * Mysql2 pool decorator.
 */

export const INITIALIZED = Symbol('connection_initialized')

declare module 'mysql2/promise' {
    interface Connection {
        [INITIALIZED]?: true
    }
}

type DecoratePoolConnectionsOptions = {
    initialSql: string[];
}

// Notice: Make sure that when the connection is obtained from the connection pool, the initialization SQL statement of
// the connection must be executed, so it should be performed synchronously.
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
