/// <reference path="../../src/plugins/stats.ts" />

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
  expect(app.app.accessRecorder).not.toBeUndefined();

  // Only http request trigger access logs.
  await app.ioEmit('q', { query: 'events-total' });
  await app.expectGet('/q/events-total').toMatchObject({
    statusCode: 200,
  });

  (await db.expect('SELECT COUNT(*) as count FROM access_logs')).toMatchObject([
    { count: 0 }
  ]);

  expect(app.app.accessRecorder.empty).toBeTruthy();
  await app.app.accessRecorder.flush();
  expect(app.app.accessRecorder.empty).toBeFalsy();

  (await db.expect('SELECT COUNT(*) as count FROM access_logs')).toMatchObject([
    { count: 1 }
  ]);
})
