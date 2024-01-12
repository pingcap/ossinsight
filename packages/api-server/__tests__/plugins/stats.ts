/// <reference path="../../src/plugins/stats/api-request-recorder.ts" />

import { bootstrapTestDatabase, getTestDatabase, releaseTestDatabase } from '../helpers/db';
import { bootstrapApp, getTestApp, releaseApp } from '../helpers/app';
import {bootstrapTestRedis, releaseTestRedis} from "../helpers/redis";

beforeAll(bootstrapTestDatabase)
beforeAll(bootstrapTestRedis)
beforeAll(bootstrapApp)
afterAll(releaseApp)
afterAll(releaseTestRedis)
afterAll(releaseTestDatabase)

test('should insert record', async () => {
  const db = getTestDatabase();
  const app = getTestApp();
  expect(app.app.apiRequestRecorder).not.toBeUndefined();

  // Only http request trigger access logs.
  await app.ioEmit('q', { query: 'events-total' });
  await app.expectGet('/q/events-total').toMatchObject({
    statusCode: 200,
  });

  (await db.expect('SELECT COUNT(*) as count FROM stats_api_requests')).toMatchObject([
    { count: 0 }
  ]);

  expect(app.app.apiRequestRecorder.empty).toBeTruthy();
  await app.app.apiRequestRecorder.flush();
  expect(app.app.apiRequestRecorder.empty).toBeFalsy();

  (await db.expect('SELECT COUNT(*) as count FROM stats_api_requests;')).toMatchObject([
    { count: 1 }
  ]);
})
