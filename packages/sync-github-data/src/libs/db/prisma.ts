import {PrismaClient} from '@prisma/client';

export function secureDatabaseUrl(value: string | undefined, environment = process.env.NODE_ENV): string {
  let url: URL;
  try {
    url = new URL((value || '').replace(/^tidb:\/\//, 'mysql://'));
    if (url.protocol !== 'mysql:' || !url.hostname || url.searchParams.has('socket')) throw new Error();
  } catch {
    throw new Error('A valid TCP MySQL DATABASE_URL is required.');
  }
  if (environment === 'test') {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      throw new Error('Tests must use a loopback database.');
    }
  } else {
    // Prisma defaults to accepting invalid certificates. Replace even an
    // explicitly insecure or duplicated sslaccept parameter.
    url.searchParams.set('sslaccept', 'strict');
  }
  for (const [name, maximum] of Object.entries({connect_timeout: 10, pool_timeout: 10, socket_timeout: 30, connection_limit: 4})) {
    const configured = Number(url.searchParams.get(name));
    url.searchParams.set(name, String(Number.isInteger(configured) && configured > 0 ? Math.min(configured, maximum) : maximum));
  }
  return url.toString();
}

export function createSecurePrismaClient(url = process.env.DATABASE_URL): PrismaClient {
  return new PrismaClient({datasources: {db: {url: secureDatabaseUrl(url)}}});
}
