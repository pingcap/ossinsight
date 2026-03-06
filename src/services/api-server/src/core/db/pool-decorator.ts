import {Connection, Pool} from "mysql2/promise";
import {pino} from "pino";

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
export function decoratePoolConnections(logger: pino.Logger, pool: Pool, { initialSql }: DecoratePoolConnectionsOptions) {
    const originalGetConnection = pool.getConnection.bind(pool);
    pool.getConnection = async () => {
        const poolConn = await originalGetConnection() as any;
        const internalConn = poolConn.connection as unknown as Connection;

        if (!internalConn[INITIALIZED]) {
            logger.info({ initialSql }, "⏳ Initializing session variables for the connection.", )
            for (const sql of initialSql) {
                await poolConn.execute(sql);
            }
            logger.info("✅ Finished to init session variables successfully.")

            Object.defineProperty(internalConn, INITIALIZED, {
                value: true,
                writable: false,
                configurable: false,
                enumerable: false,
            });
        }

        return poolConn;
    };
}
