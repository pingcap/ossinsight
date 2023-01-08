import {Pool} from "mysql2/promise";
import {pino} from "pino";

const logger = pino();

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
            logger.info({ initialSql }, "Init the connection", )
            for (const sql of initialSql) {
                await conn.execute(sql);
            }
            logger.info("Init the connection successfully")

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
