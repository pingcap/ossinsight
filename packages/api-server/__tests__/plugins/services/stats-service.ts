import { bootstrapTestDatabase, getTestDatabase, releaseTestDatabase } from '../../helpers/db';
import { StatsService } from '../../../src/plugins/services/stats-service';
import { testLogger } from '../../helpers/log';
import {getPool} from "../../../src/core/db/new";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

test('should execute valid sql', async () => {
  const db = getTestDatabase();
  const pool = getPool({
    uri: db.url()
  });
  const statsService = new StatsService(pool, testLogger);

  await statsService.addQueryStatsRecord('test', 'test', new Date(), true);

  (await db.expect('SELECT COUNT(*) as count from stats_query_summary')).toMatchObject([{
    count: 0,
  }]);

  await statsService.flush();

  (await db.expect('SELECT COUNT(*) as count from stats_query_summary')).toMatchObject([{
    count: 1,
  }]);
  await statsService.destroy();
});
