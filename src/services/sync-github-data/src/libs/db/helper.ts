import {Connection, PoolConnection} from 'mysql2/promise';

interface AnyConnectionPool {
  getConnection(): Promise<PoolConnection>;
}

export async function withConnection<T>(
  pool: AnyConnectionPool,
  run: (conn: Connection) => Promise<T>,
  onFinished?: (conn: Connection) => void | Promise<void>,
  onError?: (conn: Connection, err: unknown) => void | Promise<void>,
  onFinally?: (conn: Connection) => void | Promise<void>,
): Promise<T> {
  const conn = await pool.getConnection();

  try {
    const result = await run(conn);
    if (onFinished) {
      await onFinished(conn);
    }
    return result;
  } catch (err) {
    if (onError) {
      await onError(conn, err);
    }
    throw err;
  } finally {
    if (onFinally) {
      await onFinally(conn);
    }
    conn.release();
  }
}

export function withTransaction<T>(
  pool: AnyConnectionPool,
  run: (conn: Connection) => Promise<T>): Promise<T> {
  return withConnection(pool, run, conn => conn.commit(), conn => conn.rollback());
}
