import { bootstrapTestContainer, releaseTestContainer } from "../../helpers/db";

import Cache from "../../../src/core/cache/Cache";
import { DateTime } from 'luxon';
import { pino } from 'pino';
import {createConnection} from "mysql2/promise";
import NormalTableCacheProvider from "../../../src/core/cache/provider/NormalTableCacheProvider";
import {getConnectionOptions} from "../../../src/utils/db";

beforeAll(bootstrapTestContainer);
afterAll(releaseTestContainer);

it('cache should work', async () => {
  const log = pino().child({ 'component': 'cache' });
  const conn = await createConnection(getConnectionOptions());
  const normalCacheProvider = new NormalTableCacheProvider(conn);
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
});