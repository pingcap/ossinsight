import { TiDBPlaygroundQueryExecutor } from '../../../../src/core/executor/query-executor/TiDBPlaygroundQueryExecutor';
import { getConnectionOptions } from '../../../../src/core/db/new';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

describe('connection limits', () => {
  test('should be executed', async () => {
    const options = getConnectionOptions({
        uri: getTestDatabase().url()
    });
    const executor = new TiDBPlaygroundQueryExecutor(options, [
      'set @abc = 1;',
    ]);

    const [res] = await executor.execute<any>('', 'SELECT @abc as abc;');
    expect(res[0].abc).toBe(1);
    await executor.destroy();
  });
});
