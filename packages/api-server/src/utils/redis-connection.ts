import {isIP} from 'node:net';
import type {RedisOptions} from 'ioredis';

export function redisConnection(raw: string, allowPlaintext: boolean): RedisOptions {
  // Driver options are constructed here. Query parameters cannot change the
  // TLS policy or redirect the connection to another transport.
  try {
    const url = new URL(raw);
    const secure = url.protocol === 'rediss:';
    const host = url.hostname.replace(/^\[|\]$/g, '');
    const port = url.port ? Number(url.port) : 6379;
    const db = Number(url.pathname.slice(1));
    if ((!secure && !(allowPlaintext && url.protocol === 'redis:')) ||
        !host || (secure && !url.password) || url.search || url.hash ||
        !/^\/?(?:0|[1-9]\d*)?$/.test(url.pathname) || !Number.isSafeInteger(db) ||
        !Number.isInteger(port) || port < 1 || port > 65535) throw new Error();
    return {
      host, port, db,
      ...(url.username && {username: decodeURIComponent(url.username)}),
      ...(url.password && {password: decodeURIComponent(url.password)}),
      ...(secure && {tls: {rejectUnauthorized: true, ...(isIP(host) ? {} : {servername: host})}}),
    };
  } catch {
    throw new Error('Invalid Redis connection configuration.');
  }
}
