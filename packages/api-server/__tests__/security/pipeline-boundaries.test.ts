import Fastify from 'fastify';
import {DateTime} from 'luxon';
import pino from 'pino';
import {splitTimeRange} from '../../../pipeline/src/utils/time';
import {authenticateOperator, registerOperatorAuth} from '../../../pipeline/src/utils/operator-auth';
import fullSyncRoute, {fullSyncPipeline} from '../../../pipeline/src/routes/pipelines/_name/full_sync';
import {PipelineJobRepository} from '../../../pipeline/src/plugins/repositories/PipelineJobRepository';

const from = DateTime.utc(2024, 1, 1);
const to = DateTime.utc(2024, 1, 3);
const token = 'test-only-operator-token-'.repeat(2);

test.each([{day: 0}, {day: -1}, {day: 0.5}, {}, {unknown: 1}, {day: 1, hour: 1}, {seconds: 1}])('unsafe full-sync interval %s is rejected before scheduling', interval => {
  expect(() => splitTimeRange(from, to, interval as any)).toThrow();
});

test('range splitting is UTC, bounded, end-exclusive and clamps the final chunk', () => {
  const ranges = splitTimeRange(from, to, {day: 1});
  expect(ranges).toHaveLength(2);
  expect(ranges[1].tTo.toMillis()).toBe(to.toMillis());
  const short = splitTimeRange(from, from.plus({hours: 3}), {hours: 2});
  expect(short).toHaveLength(2);
  expect(short[1].tTo.toMillis()).toBe(from.plus({hours: 3}).toMillis());
  expect(() => splitTimeRange(to, from, {day: 1})).toThrow();
  expect(() => splitTimeRange(DateTime.invalid('bad'), to, {day: 1})).toThrow();
  expect(() => splitTimeRange(from, from.plus({years: 30}), {year: 1})).toThrow();
  expect(() => splitTimeRange(from.plus({millisecond: 1}), to, {day: 1})).toThrow();
});

test('operator authentication fails closed and exposes only a credential fingerprint', () => {
  expect(() => authenticateOperator(undefined, token)).toThrow();
  expect(() => authenticateOperator('Bearer wrong', token)).toThrow();
  expect(() => authenticateOperator(`Bearer ${token}`, undefined)).toThrow();
  const actor = authenticateOperator(`Bearer ${token}`, token);
  expect(actor).toMatch(/^pipeline-operator:[a-f0-9]{12}$/);
  expect(actor).not.toContain(token);
});

test('unauthenticated and invalid trigger requests never create work', async () => {
  const app = Fastify();
  registerOperatorAuth(app, token);
  const executeRange = jest.fn().mockResolvedValue(true);
  app.decorate('pipelineJobRepository', {executeRange, getProcessedTimeRanges: async () => []});
  app.decorate('pipelines', Object.assign(Object.create(null), {daily: {name: 'daily', processSQL: 'SELECT :from, :to'}}));
  await app.register(fullSyncRoute, {prefix: '/pipelines/:name/full_sync'});
  try {
    const url = '/pipelines/daily/full_sync/';
    expect((await app.inject({method: 'POST', url, payload: {}})).statusCode).toBe(401);
    expect((await app.inject({method: 'POST', url, headers: {authorization: `Bearer ${token}`}, payload: {interval: {day: 0}}})).statusCode).toBe(400);
    expect((await app.inject({method: 'POST', url: '/pipelines/constructor/full_sync/', headers: {authorization: `Bearer ${token}`}, payload: {}})).statusCode).toBe(404);
    expect(executeRange).not.toHaveBeenCalled();
  } finally { await app.close(); }
});

test('distinct DateTime objects representing completed ranges are skipped', async () => {
  const executeRange = jest.fn();
  const repository = {executeRange, getProcessedTimeRanges: async () => [{tFrom: DateTime.fromISO(from.toISO()!), tTo: DateTime.fromISO(to.toISO()!)}]};
  await fullSyncPipeline(pino({level: 'silent'}), repository as any, 'daily', {name: 'daily', processSQL: 'SELECT :from, :to'}, [{tFrom: from, tTo: to}]);
  expect(executeRange).not.toHaveBeenCalled();
});

test('database date and string values normalize into comparable UTC ranges', async () => {
  const repository = new PipelineJobRepository({execute: async () => [[{time_range_start: new Date('2024-01-01T00:00:00Z'), time_range_end: '2024-01-03 00:00:00'}], []]} as any);
  const [range] = await repository.getProcessedTimeRanges('daily', from, to);
  expect(range.tFrom.toMillis()).toBe(from.toMillis());
  expect(range.tTo.toMillis()).toBe(to.toMillis());
});
