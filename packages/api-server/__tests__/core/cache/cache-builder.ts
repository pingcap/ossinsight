import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from "../../helpers/db";

import {DateTime} from "luxon";
import CacheBuilder, {CacheProviderTypes} from "../../../src/core/cache/CacheBuilder";
import {pino} from "pino";
import {getConnection} from "../../../src/core/db/new";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

test('cache can be disabled', async () => {
    const log = pino().child({ 'component': 'cache-builder' });
    const conn = await getConnection({
        uri: getTestDatabase().url()
    });

    const builder = new CacheBuilder(log, false, conn);
    const cacheKey = 'test';
    const cacheValue = 'foo';
    const cache = builder.build(CacheProviderTypes.NORMAL_TABLE, cacheKey, 1);
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
    expect(cachedData.refresh).toEqual(true);
    expect(cachedData.data).toBe(cacheValue);

    conn.destroy()
});