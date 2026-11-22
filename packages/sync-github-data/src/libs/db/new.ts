import {Connection, ConnectionOptions, createConnection, createPool, Pool, PoolOptions} from "mysql2/promise";
import {readFileSync} from 'fs';

// Notice: If you provide connection information via `option.uri`, the options provided in uri
// **cannot** override the default options below
// Link: https://github.com/sidorares/node-mysql2/blob/67a18010dcffd793b9783657628b9b9ba39cc717/lib/connection_config.js#L74
const defaultConnectionOptions = {
  decimalNumbers: true,
  timezone: 'Z'
}

export function checkIfTestDatabaseIsLocal(options: ConnectionOptions) {
  const host = options.host || 'localhost';
  if (process.env.NODE_ENV === 'test' && !['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
    throw new Error('Must use local database for test.');
  }
}

export function getConnectionOptions(options: ConnectionOptions): ConnectionOptions {
  const resolved = {...defaultConnectionOptions, ...options};
  if (options.uri) {
    try {
      const url = new URL(options.uri.replace(/^tidb:\/\//, 'mysql://'));
      if (url.protocol !== 'mysql:' || !url.hostname || url.searchParams.has('socket')) throw new Error();
      Object.assign(resolved, {host: url.hostname.replace(/^\[|\]$/g, ''), port: Number(url.port || 3306),
        user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database: decodeURIComponent(url.pathname.slice(1))});
      delete resolved.uri;
    } catch {
      throw new Error('A valid TCP MySQL DATABASE_URL is required.');
    }
  }
  checkIfTestDatabaseIsLocal(resolved);
  resolved.multipleStatements = false;
  resolved.connectTimeout = Math.min(Math.max(Number(resolved.connectTimeout) || 10000, 1), 10000);
  resolved.infileStreamFactory = () => {throw new Error('Local file imports are disabled.');};
  if (process.env.NODE_ENV !== 'test') {
    const ssl = typeof resolved.ssl === 'object' ? resolved.ssl : {};
    resolved.ssl = {...ssl, ...(process.env.DB_SSL_CA ? {ca: readFileSync(process.env.DB_SSL_CA)} : {}),
      rejectUnauthorized: true, verifyIdentity: true};
  }
  return resolved;
}

export function getPoolOptions(options: PoolOptions): PoolOptions {
  return {...getConnectionOptions(options), connectionLimit: Math.min(Math.max(options.connectionLimit || 4, 1), 4)};
}

export function getConnection(extraOptions: ConnectionOptions): Promise<Connection> {
  return createConnection(getConnectionOptions(extraOptions));
}

export function getPool(extraOptions: PoolOptions): Pool {
  return createPool(getPoolOptions(extraOptions));
}

