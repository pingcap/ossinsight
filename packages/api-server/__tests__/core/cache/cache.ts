import {createTiDBPool} from "../../../src/utils/db";
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from "../../helpers/db";

import Cache from "../../../src/core/cache/Cache";
import { DateTime } from 'luxon';
import { pino } from 'pino';
import NormalTableCacheProvider from "../../../src/core/cache/provider/NormalTableCacheProvider";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

test('cache should work', async () => {
  const log = pino().child({ 'component': 'cache' });
  const pool = await createTiDBPool(getTestDatabase().url());
  const normalCacheProvider = new NormalTableCacheProvider(log, pool);
  const cacheKey = 'test2';
  const cacheHour = 1;
  const cacheValue = 'foo';
  const cache = new Cache(log, normalCacheProvider, cacheKey, cacheHour);
  const loadFunc = async () => {
    return {
      data: cacheValue,
      finishedAt: DateTime.now()
    }
  };
  const refreshData = await cache.load(loadFunc);
  expect(refreshData.refresh).toEqual(true);
  expect(refreshData.data).toBe(cacheValue);

  const cachedData = await cache.load(loadFunc);
  expect(cachedData.refresh).toEqual(undefined);
  expect(cachedData.data).toBe(cacheValue);

  await pool.end();
});