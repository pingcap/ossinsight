import { bootstrapTestContainer } from '../helpers/db';
import { bootstrapApp, getTestApp } from '../helpers/app';
import type {} from '../../src/plugins/stats/stats';

beforeAll(bootstrapTestContainer)
beforeAll(bootstrapApp)
afterAll(bootstrapApp)
afterAll(bootstrapTestContainer)

it('should insert record', async () => {
  const db = await bootstrapTestContainer();
  const app = getTestApp();
  expect(app.app.accessRecorder).not.toBeUndefined();

  await app.ioEmit('q', { query: 'events-total' });
  await Promise.all(Array(100).fill(0).map(() => app.expectGet('/q/events-total')))

  await new Promise(resolve => setTimeout(resolve, 100));
  (await db.expect('SELECT COUNT(*) as count FROM access_logs')).toMatchObject([
    { count: 100 }
  ]);

  await new Promise(resolve => setTimeout(resolve, 100));
  (await db.expect('SELECT COUNT(*) as count FROM access_logs')).toMatchObject([
    { count: 100 }
  ]);
})
