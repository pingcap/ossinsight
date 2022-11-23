/// <reference path="../../src/plugins/stats/stats.ts" />

import { bootstrapTestContainer, getTestDatabase, releaseTestContainer } from '../helpers/db';
import { bootstrapApp, getTestApp, releaseApp } from '../helpers/app';

beforeAll(bootstrapTestContainer)
beforeAll(bootstrapApp)
afterAll(releaseApp)
afterAll(releaseTestContainer)

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
