import {QueryLegacyParser} from "../src";
import {QueryLiquidParser} from "../src/core/runner/query/QueryLiquidParser";
import { buildParams, eachQuery } from './helpers/queries';
import {bootstrapTestDatabase, releaseTestDatabase, TiDBDatabase} from "./helpers/db";

let db: TiDBDatabase;

beforeAll(async () => {
  db = await bootstrapTestDatabase();
});

describe('transformed template should be valid sql', () => {

  eachQuery((queryName, sql, queryConfig) => {
    // Skip queries without params.
    const pairs = buildParams(queryConfig);
    if (!pairs.length) {
      return;
    }

    // Skipped: table name could not be auto generated.
    if (queryName === 'stats-table-ddl') {
      return;
    }

    test(`${queryName} (${pairs.length} group of params)`, async () => {
      let queryParser;
      if (queryConfig.engine === 'liquid') {
        queryParser = new QueryLiquidParser();
      } else {
        queryParser = new QueryLegacyParser();
      }

      for (let pair of pairs) {
        const parsedSql = await queryParser.parse(sql, queryConfig, pair);
        (await db.expect(parsedSql)).toBeInstanceOf(Array);
      }
    });

  });

});

afterAll(async () => {
  await releaseTestDatabase();
});