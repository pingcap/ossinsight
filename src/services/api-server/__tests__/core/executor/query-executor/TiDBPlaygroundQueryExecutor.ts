
import {TiDBPlaygroundQueryExecutor} from "../../../../src";
import {createTiDBPool} from "../../../../src/utils/db";
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';
import {testLogger} from "../../../helpers/log";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

describe('connection limits', () => {
  test('should be executed', async () => {
    const tidbPool = createTiDBPool(getTestDatabase().url());
    const executor = new TiDBPlaygroundQueryExecutor(tidbPool, null, testLogger, [
      'set @abc = 1;',
    ]);

    const [res] = await executor.execute<any>('', 'SELECT @abc as abc;');
    expect(res[0].abc).toBe(1);
    await tidbPool.end();
  });
});
