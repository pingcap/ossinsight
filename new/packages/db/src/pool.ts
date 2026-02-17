import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import pino from 'pino';

const logger = pino({ name: 'ossinsight-db' });

export interface TiDBConfig {
  url: string;
  connectionLimit?: number;
  timezone?: string;
  ssl?: boolean;
}

function parseDatabaseUrl(url: string): PoolOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '4000', 10),
    user: parsed.username || 'root',
    password: parsed.password || undefined,
    database: parsed.pathname.slice(1) || 'gharchive_dev',
    timezone: 'Z',
    decimalNumbers: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 30000,
  };
}

export function createPool(config: TiDBConfig): Pool {
  const options = parseDatabaseUrl(config.url);
  if (config.connectionLimit) {
    options.connectionLimit = config.connectionLimit;
  }
  if (config.timezone) {
    options.timezone = config.timezone;
  }

  const pool = mysql.createPool(options);

  logger.info(
    { host: options.host, port: options.port, database: options.database },
    'TiDB connection pool created'
  );

  return pool;
}

export async function closePool(pool: Pool): Promise<void> {
  await pool.end();
  logger.info('TiDB connection pool closed');
}

export async function checkConnection(pool: Pool): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch {
    return false;
  }
}
