import { buildParams, eachQuery } from './helpers/queries';
import { QueryParser } from '../src/core/runner/query/QueryParser';
import { CollectionService } from '../src/plugins/services/collection-service';
import { testLogger } from './helpers/log';
import CacheBuilder from '../src/core/cache/CacheBuilder';
import {TiDBQueryExecutor} from "../src/core/executor/query-executor/TiDBQueryExecutor";
import {bootstrapTestDatabase, releaseTestDatabase, TiDBDatabase} from "./helpers/db";
import {getConnection, getConnectionOptions} from "../src/core/db/new";

let db: TiDBDatabase;

beforeAll(async () => {
  db = await bootstrapTestDatabase();
});

describe('template should be valid sql', () => {

  eachQuery(async (name, sql, params) => {
    test(name, async () => {
      (await db.expect(sql)).toBeInstanceOf(Array);
    });
  });

});

describe('transformed template should be valid sql', () => {

  eachQuery((queryName, sql, params) => {
    // Skip queries without params.
    const pairs = buildParams(params);
    if (!pairs.length) {
      return;
    }

    // Skipped: table name could not be auto generated.
    if (queryName === 'stats-table-ddl') {
      return;
    }

    test(`${queryName} (${pairs.length} group of params)`, async () => {
      const conn = await getConnection({
        uri: db.url(),
      });
      const cacheBuilder = new CacheBuilder(testLogger, false, conn);
      const tidbQueryExecutor = new TiDBQueryExecutor(getConnectionOptions({
        uri: db.url(),
      }), false);
      const parser = new QueryParser(new CollectionService(testLogger, tidbQueryExecutor, cacheBuilder));
      for (let pair of pairs) {
        const parsedSql = await parser.parse(sql, params, pair);
        (await db.expect(parsedSql)).toBeInstanceOf(Array);
      }
    });

  });

});

afterAll(async () => {
  await releaseTestDatabase();
});