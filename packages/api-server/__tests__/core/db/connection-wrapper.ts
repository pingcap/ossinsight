import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../helpers/db';
import {createConnection, RowDataPacket} from "mysql2/promise";
import {ConnectionWrapper} from "../../../src/core/db/connection-wrapper";
import {sleep} from "../../helpers/promises";
import pino from "pino";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

const logger = pino();

describe('connection wrapper', () => {

    test('connection should be recover in a while disconnected', async () => {
        const rootConn = await createConnection(getTestDatabase().rootUrl());
        const conn = await ConnectionWrapper.new({
            uri: getTestDatabase().url()
        });

        for (let i = 0; i < 10; i++) {
            let connectionId;
            try {
                const [connectionIds] = await conn.query<RowDataPacket[]>('SELECT connection_id() AS connectionId;');
                connectionId = connectionIds[0]['connectionId'];
            } catch (err: any) {
                logger.info('Query failed: %s', err.message);
                continue;
            }
            expect(connectionId).not.toBeUndefined();
            rootConn.query('KILL ?', connectionId);
        }

        // Connection should recover in a while.
        await sleep(1000);
        const [connectionIds] = await conn.query<RowDataPacket[]>('SELECT connection_id() AS connectionId;');
        const connectionId = connectionIds[0]['connectionId'];
        expect(connectionId).not.toBeUndefined();

        await conn.destroy();
        await rootConn.end();
    });

});
