import Fastify from 'fastify';
import fp from 'fastify-plugin';
import Redis from 'ioredis';
import redisPlugin from '../../src/plugins/redis';
import {redisConnection} from '../../src/utils/redis-connection';

test('the driver and queue duplicates retain verified TLS and the selected database', () => {
  const options = redisConnection('rediss://queue:fixture%3Apass@cache.example:6380/2', false);
  const client = new Redis({...options, lazyConnect: true});
  const copy = client.duplicate();
  try {
    for (const connection of [client, copy]) {
      expect(connection.options).toMatchObject({host: 'cache.example', port: 6380, db: 2,
        username: 'queue', password: 'fixture:pass', tls: {servername: 'cache.example', rejectUnauthorized: true}});
    }
  } finally { copy.disconnect(); client.disconnect(); }
});

test.each(['redis://:fixture@cache.example/0', 'rediss://cache.example/0',
  'rediss://:fixture@cache.example/2?tls=false', 'rediss://:fixture@cache.example/invalid',
  'rediss://:fixture@cache.example:65536/0', 'http://cache.example'])(
  'production rejects unsupported Redis configurations without including credentials in errors', url => {
    expect(() => redisConnection(url, false)).toThrow(/^Invalid Redis connection configuration\.$/);
  });

test('explicit development mode permits the local test store', () => {
  expect(redisConnection('redis://127.0.0.1:6379/0', true)).toEqual({host: '127.0.0.1', port: 6379, db: 0});
});

test('the production API rejects plaintext configuration before connecting', async () => {
  const saved = process.env.NODE_ENV;
  const app = Fastify();
  try {
    process.env.NODE_ENV = 'production';
    const config = {REDIS_URL: 'redis://:fixture@cache.example/0'};
    app.decorate<typeof config>('config', config);
    await app.register(fp(async () => {}, {name: '@fastify/env'}));
    await expect(app.register(redisPlugin)).rejects.toThrow('Invalid Redis connection configuration.');
  } finally {
    if (saved === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = saved;
    await app.close();
  }
});
