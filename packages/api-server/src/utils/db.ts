import {MySQLPromisePool} from "@fastify/mysql";
import {FastifyBaseLogger} from "fastify";
import {Connection, createConnection, createPool, PoolConnection} from 'mysql2/promise';

// Connection.

export function completeDatabaseURL(originalURL: string, usedInPool: boolean = true): string {
  const url = new URL(originalURL);

  // Notice: If you provide connection information via `option.uri`, the options provided in uri
  // **cannot** override the default options below
  // Link: https://github.com/sidorares/node-mysql2/blob/67a18010dcffd793b9783657628b9b9ba39cc717/lib/connection_config.js#L74
  if (!url.searchParams.has('decimalNumbers')) {
    url.searchParams.append('decimalNumbers', 'true');
  }

  // Enable supportBigNumbers to avoid precision loss.
  if (!url.searchParams.has('supportBigNumbers')) {
    url.searchParams.append('supportBigNumbers', 'true');
  }

  // Default connection limit to 256.
  if (!url.searchParams.has('connectionLimit') && usedInPool) {
    url.searchParams.append('connectionLimit', '256');
  }

  // Default queue limit to 10000.
  if (!url.searchParams.has('queueLimit') && usedInPool) {
    url.searchParams.append('queueLimit', '10000');
  }

  // Default timezone to UTC.
  if (!url.searchParams.has('timezone')) {
    url.searchParams.append('timezone', 'Z');
  }

  // Default enableKeepAlive to true.
  if (!url.searchParams.has('enableKeepAlive')) {
    url.searchParams.append('enableKeepAlive', 'true');
  }

  return url.toString();
}

export function createTiDBPool(uri: string) {
  return createPool({
    uri: completeDatabaseURL(uri),
  });
}

export function createTiDBConnection(uri: string) {
  return createConnection({
    uri: completeDatabaseURL(uri, false),
  });
}

// Checks.

export const isProdDatabaseURL = (s: string): boolean => {
  return /tidb-cloud|gharchive_dev|github_events_api/.test(s);
}

export async function checkTiDBIfConnected(logger: FastifyBaseLogger, pool?: MySQLPromisePool, label?: string): Promise<boolean | null> {
  if (!pool) {
    if (label) {
      logger.warn(`❓ No MySQL/TiDB connection pool found (label=${label}).`);
    }
    return null;
  }

  try {
    await pool.query(`SELECT 1`);
    if (label) {
      logger.info(`✅ Connected to MySQL/TiDB database (label=${label}).`);
    }
    return true;
  } catch(err) {
    if (label) {
      logger.error(err, `❌ Failed to connect to MySQL/TiDB database (label=${label}).`);
    }
    return false;
  }
}

// Managed connection creation and release.

interface AnyConnectionPool {
  getConnection(): Promise<PoolConnection>;
}

interface WithConnectionOptions<R> {
  onFinished?: (conn: Connection, result: R) => Promise<void>,
  onError?: (conn: Connection, err: Error) => Promise<void>,
  onFinally?: (conn: Connection) => Promise<void>
}

export async function withConnection<R> (
  pool: AnyConnectionPool,
  action: (conn: PoolConnection) => Promise<R>,
  options?: WithConnectionOptions<R>
): Promise<R | undefined> {
  const conn = await pool.getConnection();

  try {
    const result = await action(conn);
    if (options?.onFinished) {
      await options?.onFinished(conn, result);
    }
    return result;
  } catch (err: any) {
    if (options?.onError) {
      await options?.onError(conn, err);
    } else {
      throw err;
    }
  } finally {
    conn.release();
    if (options?.onFinally) {
      await options?.onFinally(conn);
    }
  }
}

export function withTransaction<R> (
  pool: AnyConnectionPool,
  action: (conn: Connection) => Promise<R>,
  options?: WithConnectionOptions<R>
): Promise<R | undefined> {
  return withConnection(pool, action, {
    onError: async (conn, err) => {
      await conn.rollback();
      if (options?.onError) {
        await options?.onError(conn, err);
      } else {
        throw err;
      }
    },
    onFinished: async (conn, result) => {
      await conn.commit();
      if (options?.onFinished) {
        await options?.onFinished(conn, result);
      }
    },
    onFinally: async conn => {
      if (options?.onFinally) {
        await options?.onFinally(conn);
      }
    }
  });
}
