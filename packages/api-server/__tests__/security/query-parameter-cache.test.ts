import Fastify from 'fastify';
import pino from 'pino';
import Cache, {NeedPreFetchError} from '../../src/core/cache/Cache';
import {QueryRunner} from '../../src/core/runner/query/QueryRunner';
import queryRoute from '../../src/routes/q';
import explainRoute from '../../src/routes/q/explain/_queryName';

const logger = pino({level: 'silent'});
const name = 'cache-parameter-fixture';

function fixture(overrides: Record<string, any> = {}, sql = 'SELECT ${id} AS id') {
  const config = {public: true, cacheHours: -1, params: [{name: 'id', type: 'integer', default: 7, replaces: '${id}'}], ...overrides};
  const storage = new Map<string, string>();
  const provider = {
    get: jest.fn(async (key: string) => storage.has(key) ? JSON.parse(storage.get(key)!) : null),
    set: jest.fn(async (key: string, value: string) => {storage.set(key, value);}),
  };
  const build = jest.fn((_provider, key, hours, onlyFromCache, refreshCache) =>
    new Cache(logger, provider, key, hours, onlyFromCache, refreshCache));
  const execute = jest.fn(async (_key, options) => [options.rowsAsArray ? [[7]] : [{id: 7}], [{name: 'id'}]]);
  const runner = new QueryRunner(logger, {build} as any, {load: async () => [config, sql]} as any,
    {execute} as any, {} as any);
  return {runner, storage, provider, execute, build};
}

test.each(['query', 'explain'] as const)('%s stores only canonical declared parameters and shares equivalent requests', async method => {
  const {runner, storage, execute} = fixture();
  const first = await runner[method](name, {id: '007', privateNote: 'first caller only', format: 'unkeyed-format'});
  const second = await runner[method](name, {id: 7, privateNote: 'second caller only'});
  expect(first.params).toEqual({id: 7});
  expect(second.params).toEqual({id: 7});
  expect(first.data).toEqual(second.data);
  expect(execute).toHaveBeenCalledTimes(1);
  expect(storage.size).toBe(1);
  const saved = JSON.parse([...storage.values()][0]);
  expect(saved.params).toEqual({id: 7});
  expect(JSON.stringify([first, second, saved])).not.toMatch(/caller only|privateNote|unkeyed-format/);
});

test.each(['query', 'explain'] as const)('%s removes previously persisted unkeyed values without invalidating the cache', async method => {
  const {runner, storage, execute} = fixture();
  await runner[method](name, {id: 7});
  const [key, saved] = [...storage.entries()][0];
  const legacy = JSON.parse(saved);
  legacy.params = {id: '007', access_token: 'legacy-private-value', format: 'old-unkeyed-value'};
  storage.set(key, JSON.stringify(legacy));
  const result = await runner[method](name, {id: '7', extra: 'new-private-value'});
  expect(result.params).toEqual({id: 7});
  expect(result.data).toEqual([{id: 7}]);
  expect(JSON.stringify(result)).not.toMatch(/private-value|access_token|old-unkeyed-value/);
  expect(execute).toHaveBeenCalledTimes(1);
  expect(storage.size).toBe(1);
});

test('canonical defaults and arrays are detached from the raw request object', async () => {
  const {runner, storage} = fixture({params: [{name: 'ids', type: 'array', itemType: 'integer', default: [1, 2]}]}, 'SELECT 1');
  const input = {ids: ['01', '2'], token: 'private'};
  const result = await runner.query(name, input);
  input.ids.push('3');
  expect(result.params).toEqual({ids: [1, 2]});
  expect((await runner.query(name, {})).params).toEqual({ids: [1, 2]});
  expect(storage.size).toBe(1);
});

test.each(['legacy', 'liquid'])('%s template-mapped parameters still render once using validated caller values', async engine => {
  const params = [{name: 'flag', type: 'boolean', default: false, replaces: '${flag}', template: {true: 'AND enabled = 1', false: ''}}];
  const {runner, execute} = fixture({engine, params}, engine === 'liquid' ? 'SELECT 1 WHERE 1=1 {{flag}}' : 'SELECT 1 WHERE 1=1 ${flag}');
  const result = await runner.query(name, {flag: true, ignored: 'private'});
  expect(result.params).toEqual({flag: 'AND enabled = 1'});
  expect(execute.mock.calls[0][1].sql).toBe('SELECT 1 WHERE 1=1 AND enabled = 1');
});

test('array format keeps its separate cache entry without reflecting arbitrary format values', async () => {
  const {runner, storage, execute} = fixture();
  const array = await runner.query(name, {format: 'array', secret: 'private'});
  const object = await runner.query(name, {});
  const alias = await runner.query(name, {format: 'unkeyed-private-value'});
  expect(array.data).toEqual([[7]]);
  expect(object.data).toEqual([{id: 7}]);
  expect(alias.data).toEqual(object.data);
  for (const result of [array, object, alias]) expect(result.params).toEqual({id: 7});
  expect(execute).toHaveBeenCalledTimes(2);
  expect(storage.size).toBe(2);
});

test('simultaneous callers share execution without sharing unkeyed metadata', async () => {
  const {runner, execute} = fixture();
  let release!: () => void;
  let started!: () => void;
  const waiting = new Promise<void>(resolve => {release = resolve;});
  const executing = new Promise<void>(resolve => {started = resolve;});
  execute.mockImplementationOnce(async () => {started(); await waiting; return [[{id: 7}], []];});
  const first = runner.query(name, {id: '7', secret: 'first'});
  await executing;
  const second = runner.query(name, {id: 7, secret: 'second'});
  await new Promise(resolve => setImmediate(resolve));
  release();
  const results = await Promise.all([first, second]);
  expect(execute).toHaveBeenCalledTimes(1);
  for (const result of results) expect(result.params).toEqual({id: 7});
});

test('prefetch-only cache misses remain closed and existing precomputed results remain usable', async () => {
  const {runner, execute} = fixture({onlyFromCache: true});
  await expect(runner.query(name, {id: 7})).rejects.toBeInstanceOf(NeedPreFetchError);
  expect(execute).not.toHaveBeenCalled();
  await runner.query(name, {id: 7, internal: 'not metadata'}, {allowPrivate: true, refreshCache: true, ignoreOnlyFromCache: true});
  const result = await runner.query(name, {id: '007', external: 'not metadata'});
  expect(result.params).toEqual({id: 7});
  expect(execute).toHaveBeenCalledTimes(1);
});

test('invalid declared parameters fail before cache access even when other fields are ignored', async () => {
  const {runner, build, execute} = fixture();
  await expect(runner.query(name, {id: '7 OR 1=1', ignored: 'anything'})).rejects.toMatchObject({statusCode: 400});
  expect(build).not.toHaveBeenCalled();
  expect(execute).not.toHaveBeenCalled();
});

test.each([`/q/${name}`, `/q/explain/${name}`])('%s does not echo another HTTP caller\'s querystring fields', async path => {
  const {runner, execute} = fixture();
  const app = Fastify();
  app.decorate('queryRunner', runner);
  app.decorate('statsService', {addQueryStatsRecord: jest.fn().mockResolvedValue(undefined)});
  await app.register(queryRoute, {prefix: '/q'});
  await app.register(explainRoute, {prefix: '/q/explain/:queryName'});
  try {
    const first = await app.inject(`${path}?id=007&privateNote=first-caller`);
    const second = await app.inject(`${path}?id=7&privateNote=second-caller`);
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.json().params).toEqual({id: 7});
    expect(second.json().params).toEqual({id: 7});
    expect(second.body).not.toMatch(/privateNote|first-caller|second-caller/);
    expect(execute).toHaveBeenCalledTimes(1);
  } finally {await app.close();}
});
