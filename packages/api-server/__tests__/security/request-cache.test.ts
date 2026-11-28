import pino from 'pino';
import {TiDBQueryExecutor} from '../../src/core/executor/query-executor/TiDBQueryExecutor';
import RequestCacheProvider from '../../src/core/cache/provider/RequestCacheProvider';

test('request cache bounds the number and size of entries while preserving shared fallback', async () => {
  const shared = {get: jest.fn(async () => null), set: jest.fn()};
  const cache = new RequestCacheProvider(shared);
  for (let i = 0; i < 128; i++) await cache.set(String(i), JSON.stringify({i}));
  expect(await cache.get('0')).toEqual({i: 0});
  await cache.set('128', '{"i":128}');
  expect(await cache.get('1')).toBeNull();
  expect(await cache.get('0')).toEqual({i: 0});
  await cache.set('0', JSON.stringify('x'.repeat(65536)));
  expect(await cache.get('0')).toBeNull();
  expect(shared.set).not.toHaveBeenCalled();
});

test('local entries honor a shorter source TTL and a finite lifetime for unexpired shared results', async () => {
  let now = 1000;
  const clock = jest.spyOn(Date, 'now').mockImplementation(() => now);
  const cache = new RequestCacheProvider({get: async () => 'shared', set: jest.fn()});
  try {
    await cache.set('short', '"local"', {EX: 2});
    await cache.set('indefinite', '"local"', {EX: -1});
    now += 2000;
    expect(await cache.get('short')).toBe('shared');
    expect(await cache.get('indefinite')).toBe('local');
    now += 58000;
    expect(await cache.get('indefinite')).toBe('shared');
  } finally {clock.mockRestore();}
});

test('named statement failure discards its session before pool release', async () => {
  const failure = Object.assign(new Error('fixture client deadline'), {code: 'PROTOCOL_SEQUENCE_TIMEOUT'});
  const conn = {query: jest.fn().mockResolvedValue([[{previous: 0}], []]),
    execute: jest.fn().mockRejectedValue(failure), destroy: jest.fn(), release: jest.fn()};
  const pool = {getConnection: async () => conn};
  const executor = new TiDBQueryExecutor(pool as any, null, pino({enabled: false}));
  const options = {sql: 'SELECT 1', timeout: 500, enforceStatementTimeout: true};
  await expect(executor.execute('query:fixture', options)).rejects.toBe(failure);
  expect(conn.execute).toHaveBeenCalledWith({sql: 'SELECT 1', timeout: 500});
  expect(conn.destroy).toHaveBeenCalledTimes(1);
  expect(conn.release).toHaveBeenCalledTimes(1);
});
