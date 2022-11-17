import { TiDBQueryExecutor } from '../../../../src/core/executor/query-executor/TiDBQueryExecutor';
import { getConnectionOptions } from '../../../../src/utils/db';
import { bootstrapTestContainer, releaseTestContainer } from '../../../helpers/db';
import { expectTimeout } from '../../../helpers/timeout';

beforeAll(bootstrapTestContainer);
afterAll(releaseTestContainer);

const withQueryExecutor = async (fn: (executor: TiDBQueryExecutor) => Promise<void>, connectionLimit = 0) => {
  const executor = new TiDBQueryExecutor(getConnectionOptions({
    connectionLimit,
  }), false);
  return fn(executor).finally(() => executor.destroy());
};

describe('execute', () => {
  it('signature (key, sql) should execute sql', async () => {
    await withQueryExecutor(async executor => {
      const [res] = await executor.execute<any>('notimportant', 'SELECT COUNT(*) as count FROM github_events');
      expect(res[0].count).toBe(0);
    });
  });

  it('signature (key, sql, values) should execute sql', async () => {
    await withQueryExecutor(async executor => {
      const [res] = await executor.execute<any>('notimportant', 'SELECT COUNT(?) as count FROM github_events', ['id']);
      expect(res[0].count).toBe(0);
    });
  });

  it('signature (key, options) should execute sql', async () => {
    await withQueryExecutor(async executor => {
      const [res] = await executor.execute<any>('notimportant', { sql: 'SELECT COUNT(?) as count FROM github_events', values: ['id'] });
      expect(res[0].count).toBe(0);
    });
  });
});

describe('getConnection', () => {
  it('should wait if pool drained', async () => {
    await withQueryExecutor(async executor => {
      await executor.getConnection();
      await expectTimeout(executor.execute('', 'SELECT 1;'));
    }, 1);
  });
});
