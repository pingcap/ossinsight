import { TiDBQueryExecutor } from '../../../../src';
import {createTiDBPool} from "../../../../src/utils/db";
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';
import { expectTimeout } from '../../../helpers/timeout';

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

const withQueryExecutor = async (fn: (executor: TiDBQueryExecutor) => Promise<void>, connectionLimit = 0) => {
  const uri = new URL(getTestDatabase().url());
  uri.searchParams.delete("connectionLimit");
  uri.searchParams.append("connectionLimit", connectionLimit.toString());
  const tidbPool = createTiDBPool(uri.toString());
  const executor = new TiDBQueryExecutor(tidbPool);
  return fn(executor).finally(() => tidbPool.end());
};

describe('execute', () => {
  test('signature (key, sql) should execute sql', async () => {
    await withQueryExecutor(async executor => {
      const [res] = await executor.execute<any>('notimportant', 'SELECT COUNT(*) as count FROM github_events');
      expect(res[0].count).toBe(0);
    });
  });

  test('signature (key, sql, values) should execute sql', async () => {
    await withQueryExecutor(async executor => {
      const [res] = await executor.execute<any>('notimportant', 'SELECT COUNT(?) as count FROM github_events', ['id']);
      expect(res[0].count).toBe(0);
    });
  });

  test('signature (key, options) should execute sql', async () => {
    await withQueryExecutor(async executor => {
      const [res] = await executor.execute<any>('notimportant', { sql: 'SELECT COUNT(?) as count FROM github_events', values: ['id'] });
      expect(res[0].count).toBe(0);
    });
  });
});

describe('getConnection', () => {
  test('should wait if pool drained', async () => {
    await withQueryExecutor(async executor => {
      await executor.getConnection();
      await expectTimeout(executor.execute('', 'SELECT 1;'));
    }, 1);
  });
});
