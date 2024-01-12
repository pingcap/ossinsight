import {createTiDBPool} from "../../../src/utils/db";
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from "../../helpers/db";

import {BatchLoader} from "../../../src/core/db/batch-loader";
import {testLogger} from "../../helpers/log";

beforeAll(bootstrapTestDatabase);
afterAll(releaseTestDatabase);

test('flush after reaching the number of batch_size', async () => {
    const batchSize = 3;
    const flushInterval = -1;
    const insertSQL = `INSERT INTO stats_api_requests (
        client_ip, client_origin, method, path, query, status_code, error, is_dev, duration
    ) VALUES ?`;
    const recordsWillBeFlush = [
        ['127.0.0.1', 'https://example.com', 'GET', '/test1', '{"foo": "bar"}', 200, 0, 1, 0.25],
        ['127.0.0.1', 'https://example.com', 'GET', '/test2', '{"foo": "bar"}', 200, 0, 1, 0.25],
        ['127.0.0.1', 'https://example.com', 'GET', '/test3', '{"foo": "bar"}', 200, 0, 1, 0.25]
    ];
    const recordsWillNotBeFlush = [
        ['127.0.0.1', 'https://example.com', 'GET', '/test1', '{"foo": "bar"}', 200, 0, 1, 0.25]
    ];

    const pool = createTiDBPool(getTestDatabase().url());
    const queryMethod = jest.spyOn(pool, 'query');
    const accessRecorder = new BatchLoader(testLogger, pool, insertSQL, {
        batchSize: batchSize,
        flushInterval: flushInterval
    });
    for (let record of [...recordsWillBeFlush, ...recordsWillNotBeFlush]) {
        await accessRecorder.insert(record);
    }

    expect(queryMethod).toBeCalled();
    expect(queryMethod.mock.calls[0][0]).toBe(insertSQL);
    expect(queryMethod.mock.calls[0][1]).toEqual([recordsWillBeFlush]);

    queryMethod.mockRestore();
    await accessRecorder.destroy();
});

test('flush after an interval', async () => {
    const batchSize = 10;
    const flushInterval = 1;
    const insertSQL = `INSERT INTO stats_api_requests (
        client_ip, client_origin, method, path, query, status_code, error, is_dev, duration
    ) VALUES ?`;
    const records = [
        ['127.0.0.1', 'https://example.com', 'GET', '/test1', '{"foo": "bar"}', 200, 0, 1, 0.25],
        ['127.0.0.1', 'https://example.com', 'GET', '/test2', '{"foo": "bar"}', 200, 0, 1, 0.25],
        ['127.0.0.1', 'https://example.com', 'GET', '/test3', '{"foo": "bar"}', 200, 0, 1, 0.25]
    ];

    const pool = createTiDBPool(getTestDatabase().url());
    const queryMethod = jest.spyOn(pool, 'query').mockImplementation((sql, values) => {
        expect(sql).toBe(insertSQL);
        return [] as any
    });
    const accessRecorder = new BatchLoader(testLogger, pool, insertSQL, {
        batchSize: batchSize,
        flushInterval: flushInterval
    });
    for (let record of records) {
        await accessRecorder.insert(record);
    }

    await new Promise((r) => setTimeout(r, flushInterval * 1000 + 100));
    expect(queryMethod).toBeCalled();

    queryMethod.mockRestore();
    await accessRecorder.destroy();
});

test('flush three times', async () => {
    const batchSize = 2;
    const flushInterval = -1;
    const insertSQL = `INSERT INTO stats_api_requests (
        client_ip, client_origin, method, path, query, status_code, error, is_dev, duration
    ) VALUES ?`;
    const records = [
        ['127.0.0.1', 'https://example.com', 'GET', '/test1', '{"foo": "bar"}', 200, 0, 1, 0.25],
        ['127.0.0.1', 'https://example.com', 'GET', '/test2', '{"foo": "bar"}', 200, 0, 1, 0.25],
        ['127.0.0.1', 'https://example.com', 'GET', '/test3', '{"foo": "bar"}', 200, 0, 1, 0.25],
        ['127.0.0.1', 'https://example.com', 'GET', '/test4', '{"foo": "bar"}', 200, 0, 1, 0.25],
        ['127.0.0.1', 'https://example.com', 'GET', '/test5', '{"foo": "bar"}', 200, 0, 1, 0.25]
    ];

    const pool = createTiDBPool(getTestDatabase().url());
    const queryMethod = jest.spyOn(pool, 'query').mockImplementation((sql, values) => {
        expect(sql).toBe(insertSQL);
        return [] as any;
    });
    const accessRecorder = new BatchLoader(testLogger, pool, insertSQL, {
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
    await accessRecorder.destroy();
});


