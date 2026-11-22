import pino from 'pino';
import {DateTime} from 'luxon';
import Cache from '../../src/core/cache/Cache';
import {QueryRunner, QueryType} from '../../src/core/runner/query/QueryRunner';

const logger = pino({level: 'silent'});

test('simultaneous identical keys in different backing providers cannot exchange data', async () => {
  const firstProvider = {get: jest.fn(), set: jest.fn()};
  const secondProvider = {get: jest.fn(), set: jest.fn()};
  let release!: () => void;
  const wait = new Promise<void>(resolve => {release = resolve;});
  const first = new Cache(logger, firstProvider, 'same-key', 0).load(async () => {
    await wait; return {data: 'private database', finishedAt: DateTime.utc()};
  });
  const second = new Cache(logger, secondProvider, 'same-key', 0).load(async () => ({data: 'public database', finishedAt: DateTime.utc()}));
  release();
  expect((await first).data).toBe('private database');
  expect((await second).data).toBe('public database');
  expect(firstProvider.set).not.toHaveBeenCalled();
  expect(secondProvider.set).not.toHaveBeenCalled();
});

test('query cache keys distinguish source databases, accounts and SQL/template changes', () => {
  function runner(database: string, user = 'reader') {
    return new QueryRunner(logger, {} as any, {} as any,
      {pool: {pool: {config: {connectionConfig: {host: 'database.example', port: 4000, database, user}}}}} as any, {} as any) as any;
  }
  const a = runner('production'); const b = runner('staging'); const otherUser = runner('production', 'operator');
  const key = (r: any, sql = 'SELECT 1', config = {params: []}) => r.buildCacheKey(QueryType.QUERY, 'query', config, {}, sql);
  expect(key(a)).not.toBe(key(b));
  expect(key(a)).not.toBe(key(otherUser));
  expect(key(a)).not.toBe(key(a, 'SELECT 2'));
  expect(key(a)).toBe(key(runner('production')));
});
