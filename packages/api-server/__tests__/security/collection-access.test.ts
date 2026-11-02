import pino from 'pino';
import {CollectionService} from '../../src/plugins/services/collection-service';
import {QueryRunner} from '../../src/core/runner/query/QueryRunner';
import {validateCollectionId} from '@ossinsight/types';

const logger = pino({level: 'silent'});

test.each([0, -1, 1.2, Number.MAX_SAFE_INTEGER + 1, {}, ['1'], '1 OR 1=1', '1e3'])('rejects invalid collection identity %s', value => {
  expect(() => validateCollectionId(value)).toThrow();
});

test('revoked collection visibility is checked before serving a previously cached result', async () => {
  let visible = true;
  const executor = {execute: jest.fn(async () => [visible ? [{id: 1}] : [], []])};
  const cached = {data: [{repo_name: 'private/repository'}]};
  const build = jest.fn(() => ({load: async () => cached}));
  const service = new CollectionService(logger, executor as any, {build} as any);
  expect(await service.getCollectionRepos(1)).toBe(cached);
  visible = false;
  await expect(service.getCollectionRepos(1)).rejects.toMatchObject({statusCode: 404});
  expect(build).toHaveBeenCalledTimes(1);
  expect(executor.execute).toHaveBeenCalledTimes(2);
});

test.each(['query', 'explain'] as const)('named %s cannot bypass collection visibility through the cache', async method => {
  const build = jest.fn();
  const load = jest.fn().mockResolvedValue([{public: true, params: [{name: 'collectionId', type: 'integer'}]}, 'SELECT 1']);
  const execute = jest.fn().mockResolvedValue([[], []]);
  const runner = new QueryRunner(logger, {build} as any, {load} as any, {} as any, {execute} as any);
  await expect(runner[method]('collection-issues-history', {collectionId: 7})).rejects.toMatchObject({statusCode: 404});
  expect(execute).toHaveBeenCalledWith(expect.any(String), [7]);
  expect(build).not.toHaveBeenCalled();
});

test('cache keys distinguish parameter boundaries and reuse equivalent normalized values', async () => {
  const config = {public: true, params: [{name: 'a', pattern: '^[a-z_]+$'}, {name: 'b', pattern: '^[a-z_]+$'}]};
  const build = jest.fn(() => ({load: async () => ({data: []})}));
  const loader = {load: async () => [config, 'SELECT 1']};
  const runner = new QueryRunner(logger, {build} as any, loader as any, {} as any, {} as any);
  await runner.query('new-query', {a: 'a_b', b: 'c'});
  await runner.query('new-query', {a: 'a', b: 'b_c'});
  await runner.query('new-query', {a: 'a_b', b: 'c', unrelated: 'cache-buster'});
  expect(build.mock.calls[0][1]).not.toBe(build.mock.calls[1][1]);
  expect(build.mock.calls[0][1]).toBe(build.mock.calls[2][1]);
});
