import { bootstrapTestContainer, releaseTestContainer } from '../helpers/db';
import { StatsService } from '../../src/services/stats-service';
import { testLogger } from '../helpers/log';

beforeAll(bootstrapTestContainer);
afterAll(releaseTestContainer);

it('should execute valid sql', async () => {
  const statsService = new StatsService(testLogger)

  await statsService.addQueryStatsRecord('test', 'test', new Date(), true)

  statsService.destroy()
})
