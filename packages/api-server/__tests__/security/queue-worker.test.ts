import {randomUUID} from 'node:crypto';
jest.mock('../../src/utils/sqlite', () => ({saveQueryResultToSqlite: jest.fn()}));
import {ExplorerService} from '../../src/plugins/services/explorer-service';
import pino from 'pino';
import {decoratePoolConnections} from '../../src/core/db/pool-decorator';
import {questionProcessor} from '../../src/worker/process-job';
import {workerConfig} from '../../src/worker/config';
import {workerLogger} from '../../src/worker/logger';
import {workerOperations} from '../../src/worker/operations';
import {QuestionQueueNames, QuestionStatus} from '../../src/plugins/services/explorer-service/types';

function fixture() {
  const question: any = {id: randomUUID(), queueJobId: randomUUID(), queueName: QuestionQueueNames.High,
    userId: 42, status: QuestionStatus.Waiting, title: 'private title', querySQL: 'SELECT * FROM github_events'};
  const job: any = {id: question.queueJobId, data: {...question, querySQL: 'DROP TABLE sys_users', userId: 999}};
  const records: any[] = [];
  const service = {getQuestionById: jest.fn().mockResolvedValue(question),
    resolveQuestion: jest.fn().mockResolvedValue({result: 'private results'})};
  return {question, job, service, records,
    run: questionProcessor(service, QuestionQueueNames.High, record => records.push(record))};
}

test('queued SQL and identity are ignored; results stay out of the queue and logs', async () => {
  const {question, job, service, records, run} = fixture();
  expect(await run(job)).toBeUndefined();
  expect(service.resolveQuestion).toHaveBeenCalledWith(job, question);
  expect(records.at(-1)).toMatchObject({actor: 'user:42', outcome: 'completed'});
  expect(JSON.stringify(records)).not.toMatch(/private|DROP|SELECT/);
});

test.each([QuestionQueueNames.High, QuestionQueueNames.Low])('producer sends only the reference to %s', async queue => {
  const {question} = fixture();
  question.queueName = queue;
  const target: any = {add: jest.fn()};
  const logger = pino({enabled: false});
  const service = new ExplorerService(logger, {} as any, {} as any, {} as any, target, target);
  await service.pushJobToQueue(logger, question);
  expect(target.add).toHaveBeenCalledWith(queue, {id: question.id}, {jobId: question.queueJobId});
});

test.each([
  {userId: 0}, {userId: -1}, {userId: 1.5}, {userId: null},
  {userId: 0, batchJobId: randomUUID(), needReview: false},
  {queueName: QuestionQueueNames.Low}, {queueJobId: randomUUID()},
  {status: QuestionStatus.Cancel}, {status: QuestionStatus.Success}, {status: QuestionStatus.Error},
])('unowned, stale, mismatched or terminal work is rejected: %p', async patch => {
  const {question, job, service, records, run} = fixture();
  Object.assign(question, patch);
  await expect(run(job)).rejects.toThrow('Question execution failed.');
  expect(service.resolveQuestion).not.toHaveBeenCalled();
  expect(records.at(-1).outcome).toBe('failed');
});

test('an operator-created system review batch is supported using persisted metadata', async () => {
  const {question, job, records, run} = fixture();
  Object.assign(question, {userId: 0, batchJobId: randomUUID(), needReview: true});
  await run(job);
  expect(records.at(-1)).toMatchObject({actor: `batch:${question.batchJobId}`, outcome: 'completed'});
});

test('deleted questions and malformed references cannot execute work', async () => {
  const {job, service, run} = fixture();
  service.getQuestionById.mockResolvedValueOnce(null);
  await expect(run(job)).rejects.toThrow('Question execution failed.');
  job.data.id = 'private untrusted input';
  await expect(run(job)).rejects.toThrow('Question execution failed.');
  expect(service.getQuestionById).toHaveBeenCalledTimes(1);
  expect(service.resolveQuestion).not.toHaveBeenCalled();
});

test('driver failure fails the BullMQ processor without retaining the raw error', async () => {
  const {job, service, records, run} = fixture();
  service.resolveQuestion.mockRejectedValueOnce(new Error('password=secret SELECT private'));
  await expect(run(job)).rejects.toThrow(/^Question execution failed\.$/);
  expect(records.at(-1).outcome).toBe('failed');
  expect(JSON.stringify(records)).not.toMatch(/password|private|secret/);
});

test('SQL services cannot leak message arguments, driver objects or child bindings', () => {
  const output: string[] = [];
  const log = workerLogger({write: chunk => {output.push(chunk);}});
  log.child({sql: 'private query', token: 'private token'}).error(
    {err: new Error('private error'), sql: 'private SQL', event: 'explorer_worker', outcome: 'failed'},
    'private message %s', 'private interpolation');
  expect(output).toHaveLength(1);
  expect(output[0]).not.toContain('private');
  expect(JSON.parse(output[0])).toMatchObject({event: 'explorer_worker', outcome: 'failed'});
});

const env = {DATABASE_URL: 'mysql://metadata:test@database.example/analytics',
  PLAYGROUND_DATABASE_URL: 'mysql://reader:test@database.example/analytics',
  REDIS_URL: 'redis://:test@127.0.0.1:6379'};

test('worker connections enforce production TLS, bounded pools and separate analytics credentials', () => {
  const config = workerConfig(env);
  const url = new URL(config.playground);
  expect(url.username).toBe('reader');
  expect(JSON.parse(url.searchParams.get('ssl')!)).toEqual({rejectUnauthorized: true, verifyIdentity: true});
  expect(+url.searchParams.get('connectionLimit')!).toBe(config.high + config.low + 2);
  expect(() => workerConfig({...env, PLAYGROUND_DATABASE_URL: undefined})).toThrow();
  expect(() => workerConfig({...env, PLAYGROUND_DATABASE_URL: 'mysql://root:test@database.example/analytics'})).toThrow();
  expect(() => workerConfig({...env, REDIS_URL: 'redis://127.0.0.1:6379'})).toThrow();
  expect(() => workerConfig({...env, EXPLORER_QUERY_SQL_TIMEOUT: '0'})).toThrow();
  expect(() => workerConfig({...env, EXPLORER_HIGH_QUEUE_CONCURRENT: '2000'})).toThrow();
});

test('worker health reflects readiness; metrics require the operator credential', async () => {
  let ready = false;
  const token = 'test-operator-token'.repeat(4);
  const app = workerOperations(() => ready, token);
  try {
    expect((await app.inject('/healthy')).statusCode).toBe(503);
    ready = true;
    expect((await app.inject('/healthy')).json()).toEqual({healthy: true});
    expect((await app.inject('/metrics')).statusCode).toBe(401);
    expect((await app.inject({url: '/metrics', headers: {authorization: 'Bearer wrong'}})).statusCode).toBe(401);
    expect((await app.inject({url: '/metrics', headers: {authorization: `Bearer ${token}`}})).statusCode).toBe(200);
    expect((await app.inject('/explorer/answer')).statusCode).toBe(404);
  } finally { await app.close(); }
});

test('a failed SQL session policy destroys the connection instead of leaking a pool slot', async () => {
  const connection = {connection: {}, execute: jest.fn().mockRejectedValue(new Error('unsupported session variable')),
    destroy: jest.fn()};
  const pool: any = {getConnection: async () => connection};
  decoratePoolConnections(pino({enabled: false}), pool, {initialSql: ['SET SESSION max_execution_time = 30000']});
  await expect(pool.getConnection()).rejects.toThrow('unsupported session variable');
  expect(connection.destroy).toHaveBeenCalledTimes(1);
});
