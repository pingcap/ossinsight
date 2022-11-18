import { TiDBPlaygroundQueryExecutor } from '../../../../src/core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import { getConnectionOptions } from '../../../../src/utils/db';
import { bootstrapTestContainer, releaseTestContainer } from '../../../helpers/db';

beforeAll(bootstrapTestContainer);
afterAll(releaseTestContainer);

describe('connection limits', () => {
  it('should be executed', async () => {
    const executor = new TiDBPlaygroundQueryExecutor(getConnectionOptions(), [
      'set @abc = 1;',
    ]);

    const [res] = await executor.execute<any>('', 'SELECT @abc as abc;');
    expect(res[0].abc).toBe(1);
  });
});
