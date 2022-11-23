import { bootstrapTestContainer, getTestDatabase, releaseTestContainer } from '../helpers/db';
import { StatsService } from '../../src/services/stats-service';
import { testLogger } from '../helpers/log';

beforeAll(bootstrapTestContainer);
afterAll(releaseTestContainer);

test('should execute valid sql', async () => {
  const db = getTestDatabase();
  const statsService = new StatsService(testLogger);

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
