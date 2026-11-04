jest.mock('../../src/utils/sqlite', () => ({saveQueryResultToSqlite: jest.fn()}));
import Fastify from 'fastify';
import {ExplorerService} from '../../src/plugins/services/explorer-service';
import {APIError} from '../../src/utils/error';
import recommend from '../../src/routes/explorer/questions/_questionId/recommend';
import cancel from '../../src/routes/explorer/questions/_questionId/recommend/cancel';
import tags from '../../src/routes/explorer/questions/_questionId/tags';
import refresh from '../../src/routes/explorer/questions/recommend/batchRefresh';

const audit = {userId: 42, requestId: 'verified-request'};
const cases = [
  [recommend, 'recommendQuestion'], [cancel, 'cancelRecommendQuestion'],
  [tags, 'updateQuestionTags'], [refresh, 'refreshRecommendQuestions'],
] as const;

test.each(cases)('%p forwards the verified actor rather than client supplied identity', async (plugin, method) => {
  const app = Fastify({genReqId: () => audit.requestId});
  const mutate = jest.fn().mockResolvedValue(undefined);
  const authorize = jest.fn().mockResolvedValue(undefined);
  app.decorate('authenticate', async () => {});
  app.decorate('userService', {getUserIdOrCreate: async () => audit.userId});
  app.decorate('explorerService', {[method]: mutate, checkIfTrustedUsersOrError: authorize});
  await app.register(plugin as any, {prefix: '/questions/:questionId'});
  try {
    const response = await app.inject({method: 'POST', url: '/questions/9bb94d62-1abe-4a6d-b05e-e871713ed721/',
      payload: {tagIds: [1, 2], userId: 999, requestId: 'forged'}});
    expect(response.statusCode).toBe(200);
    expect(authorize).toHaveBeenCalledWith(42);
    expect(mutate.mock.calls[0].at(-1)).toEqual(audit);
    authorize.mockRejectedValueOnce(new APIError(403, 'Forbidden'));
    expect((await app.inject({method: 'POST', url: '/questions/9bb94d62-1abe-4a6d-b05e-e871713ed721/', payload: {tagIds: []}})).statusCode).toBe(403);
    expect(mutate).toHaveBeenCalledTimes(1);
  } finally { await app.close(); }
});

function service() {
  const instance: any = Object.create(ExplorerService.prototype);
  const records: any[] = [];
  instance.logger = {info: (entry: any) => records.push(entry), error: (entry: any) => records.push(entry)};
  return {instance, records};
}

test('mutation success and failure retain the actor, target and outcome without raw exceptions', async () => {
  const {instance, records} = service();
  instance.recommendQuestionInternal = jest.fn().mockResolvedValue(undefined);
  await instance.recommendQuestion('question-1', audit);
  expect(records.at(-1)).toMatchObject({actor: 'user:42', requestId: audit.requestId, resource: 'question:question-1', action: 'recommend', outcome: 'completed'});
  instance.recommendQuestionInternal.mockRejectedValueOnce(new Error('secret database password'));
  await expect(instance.recommendQuestion('question-1', audit)).rejects.toThrow();
  expect(records.at(-1).outcome).toBe('failed');
  expect(JSON.stringify(records)).not.toContain('secret database password');
  await expect(instance.recommendQuestion('question-1', {userId: 0, requestId: 'fake'})).rejects.toMatchObject({statusCode: 401});
  expect(instance.recommendQuestionInternal).toHaveBeenCalledTimes(2);
});

test('batch jobs preserve actor and request correlation across asynchronous items and report partial failure', async () => {
  const {instance, records} = service();
  instance.getRecommendQuestionsByTag = async () => [1, 2, 3].map(id => ({questionId: `old-${id}`, title: `private title ${id}`}));
  instance.newQuestion = jest.fn().mockResolvedValueOnce({id: 'new-1', hitCache: true})
    .mockRejectedValueOnce(new Error('secret internal failure')).mockResolvedValueOnce({id: 'new-3', hitCache: true});
  await expect(instance.refreshRecommendQuestions(audit)).rejects.toThrow('could not be refreshed');
  const items = records.filter(record => record.event === 'explorer_privileged_refresh');
  expect(items).toHaveLength(3);
  expect(items.every(record => record.actor === 'user:42' && record.requestId === audit.requestId)).toBe(true);
  expect(new Set(items.map(record => record.batchJobId)).size).toBe(1);
  expect(records).toContainEqual(expect.objectContaining({event: 'explorer_privileged_batch', total: 3, failed: 1, outcome: 'failed'}));
  expect(records.at(-1).outcome).toBe('failed');
  expect(JSON.stringify(records)).not.toMatch(/private title|secret internal failure/);
});

test('an empty refresh completes without waiting forever for a queue drain event', async () => {
  const {instance, records} = service();
  instance.getRecommendQuestionsByTag = async () => [];
  await instance.refreshRecommendQuestions(audit);
  expect(records.at(-1)).toMatchObject({action: 'refresh_recommendations', outcome: 'completed'});
});

test('invalid tag changes are rejected before acquiring a database connection', async () => {
  const {instance} = service();
  instance.tidb = {getConnection: jest.fn()};
  for (const tagIds of [[-1], [1.5], Array(101).fill(1)]) {
    await expect(instance.updateQuestionTags('q', tagIds, audit)).rejects.toMatchObject({statusCode: 400});
  }
  expect(instance.tidb.getConnection).not.toHaveBeenCalled();
});

test('tag replacement is reported as completed only after the transaction commits', async () => {
  const {instance, records} = service();
  const conn = {query: jest.fn().mockResolvedValue([]), commit: jest.fn().mockImplementation(async () => {
    expect(records.at(-1).outcome).toBe('started');
  }), rollback: jest.fn(), release: jest.fn()};
  instance.tidb = {getConnection: async () => conn};
  instance.setQuestionTags = jest.fn().mockResolvedValue(undefined);
  await instance.updateQuestionTags('question-1', [1, 2], audit);
  expect(conn.commit).toHaveBeenCalledTimes(1);
  expect(records.at(-1)).toMatchObject({actor: 'user:42', action: 'replace_tags', tagIds: [1, 2], outcome: 'completed'});
  conn.commit.mockRejectedValueOnce(new Error('database detail'));
  await expect(instance.updateQuestionTags('question-1', [3], audit)).rejects.toThrow();
  expect(conn.rollback).toHaveBeenCalledTimes(1);
  expect(records.at(-1).outcome).toBe('failed');
  expect(conn.release).toHaveBeenCalledTimes(2);
});
