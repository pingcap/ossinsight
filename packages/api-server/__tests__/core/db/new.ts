import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../helpers/db';
import {getPool} from "../../../src/core/db/new";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

describe('get pool', () => {

    test('setting connectionLimit by uri should work', async () => {
        const pool = await getPool({
            uri: `${getTestDatabase().url()}?connectionLimit=30`
        });

        // @ts-ignore
        expect(pool.pool.config.connectionLimit).toBe(30);
    });

});
