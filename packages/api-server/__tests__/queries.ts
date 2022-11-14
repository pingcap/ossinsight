import { bootstrapTestContainer, getExecutor, releaseTestContainer } from './helpers/db';
import { buildParams, eachQuery } from './helpers/queries';
import { QueryParser } from '../src/core/runner/query/QueryParser';
import { CollectionService } from '../src/services/collection-service';
import { testLogger } from './helpers/log';
import CacheBuilder from '../src/core/cache/CacheBuilder';

beforeAll(bootstrapTestContainer, 30000);
afterAll(releaseTestContainer, 30000);

describe('query', () => {
  eachQuery((name, sql, params) => {
    describe(name, () => {
      it('template should be valid sql', async () => {
        const db = await bootstrapTestContainer();
        const { output } = await db.exec([sql]);
        expect(output.startsWith('[') && output.endsWith(']')).toBeTruthy();
      });

      const pairs = buildParams(params)

      if (!pairs.length) {
        return
      }

      // table name could not be auto generated.
      if (name === 'stats-table-ddl') {
        return
      }

      it(`transformed template should be valid sql (${pairs.length} group of params)`, async () => {
        const db = await bootstrapTestContainer();
        const parser = new QueryParser(new CollectionService(testLogger, getExecutor(), new CacheBuilder(testLogger, false)));
        for (let pair of pairs) {
          const parsedSql = await parser.parse(sql, params, pair)
          const { output } = await db.exec([parsedSql]);
          expect(output.startsWith('[') && output.endsWith(']')).toBeTruthy();
        }
      });
    });
  });
});
