import { bootstrapTestContainer, releaseTestContainer } from "../../helpers/db";

import {BatchLoader} from "../../../src/core/db/BatchLoader";
import {createPool} from "mysql2/promise";
import {getConnectionOptions} from "../../../src/utils/db";

beforeAll(bootstrapTestContainer);
afterAll(releaseTestContainer);

it('flush after reaching the number of batch_size', async () => {
    const batchSize = 3;
    const flushInterval = -1;
    const insertAccessLogSQL = `INSERT INTO test (
  remote_addr, origin, status_code, request_path, request_params
) VALUES ?`;
    const recordsWillBeFlush = [
        ['127.0.0.1', 'https://example.com', 200, '/test1', '{"foo": "bar"}'],
        ['127.0.0.1', 'https://example.com', 200, '/test2', '{"foo": "bar"}'],
        ['127.0.0.1', 'https://example.com', 200, '/test3', '{"foo": "bar"}']
    ];
    const recordsWillNotBeFlush = [
        ['127.0.0.1', 'https://example.com', 200, '/test1', '{"foo": "bar"}']
    ];

    const pool = createPool(getConnectionOptions());
    const queryMethod = jest.spyOn(pool, 'query');
    const accessRecorder = new BatchLoader(pool, insertAccessLogSQL, {
        batchSize: batchSize,
        flushInterval: flushInterval
    });
    for (let record of [...recordsWillBeFlush, ...recordsWillNotBeFlush]) {
        await accessRecorder.insert(record);
    }

    expect(queryMethod).toBeCalled();
    expect(queryMethod.mock.calls[0][0]).toBe(insertAccessLogSQL);
    expect(queryMethod.mock.calls[0][1]).toEqual([recordsWillBeFlush]);

    queryMethod.mockRestore();
    accessRecorder.destroy();
});

it('flush after an interval', async () => {
    const batchSize = 10;
    const flushInterval = 1;
    const insertAccessLogSQL = `INSERT INTO test (
  remote_addr, origin, status_code, request_path, request_params
) VALUES ?`;
    const records = [
        ['127.0.0.1', 'https://example.com', 200, '/test1', '{"foo": "bar"}'],
        ['127.0.0.1', 'https://example.com', 200, '/test2', '{"foo": "bar"}'],
        ['127.0.0.1', 'https://example.com', 200, '/test3', '{"foo": "bar"}']
    ];

    const pool = createPool(getConnectionOptions());
    const queryMethod = jest.spyOn(pool, 'query').mockImplementation((sql, values) => {
        expect(sql).toBe(insertAccessLogSQL);
        return [] as any
    });
    const accessRecorder = new BatchLoader(pool, insertAccessLogSQL, {
        batchSize: batchSize,
        flushInterval: flushInterval
    });
    for (let record of records) {
        await accessRecorder.insert(record);
    }

    await new Promise((r) => setTimeout(r, flushInterval * 1000 + 100));
    expect(queryMethod).toBeCalled();

    queryMethod.mockRestore();
    accessRecorder.destroy();
});

it('flush three times', async () => {
    const batchSize = 2;
    const flushInterval = -1;
    const insertAccessLogSQL = `INSERT INTO test (
  remote_addr, origin, status_code, request_path, request_params
) VALUES ?`;
    const records = [
        ['127.0.0.1', 'https://example.com', 200, '/test1', '{"foo": "bar"}'],
        ['127.0.0.1', 'https://example.com', 200, '/test2', '{"foo": "bar"}'],
        ['127.0.0.1', 'https://example.com', 200, '/test3', '{"foo": "bar"}'],
        ['127.0.0.1', 'https://example.com', 200, '/test4', '{"foo": "bar"}'],
        ['127.0.0.1', 'https://example.com', 200, '/test5', '{"foo": "bar"}']
    ];

    const pool = createPool(getConnectionOptions());
    const queryMethod = jest.spyOn(pool, 'query').mockImplementation((sql, values) => {
        expect(sql).toBe(insertAccessLogSQL);
        return [] as any;
    });
    const accessRecorder = new BatchLoader(pool, insertAccessLogSQL, {
        batchSize: batchSize,
        flushInterval: flushInterval
    });
    for (let record of records) {
        await accessRecorder.insert(record);
    }
    await accessRecorder.flush();

    expect(queryMethod).toBeCalledTimes(3);
    expect(queryMethod.mock.calls[0][1][0]).toHaveLength(2);
    expect(queryMethod.mock.calls[1][1][0]).toHaveLength(2);
    expect(queryMethod.mock.calls[2][1][0]).toHaveLength(1);

    queryMethod.mockRestore();
    accessRecorder.destroy();
});


