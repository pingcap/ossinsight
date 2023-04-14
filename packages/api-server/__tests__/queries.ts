import { buildParams, eachQuery } from './helpers/queries';
import { QueryParser } from '../src/core/runner/query/QueryParser';
import {bootstrapTestDatabase, releaseTestDatabase, TiDBDatabase} from "./helpers/db";

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
      const parser = new QueryParser();
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