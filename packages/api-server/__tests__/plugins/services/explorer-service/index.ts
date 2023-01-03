import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';
import {bootstrapApp, getTestApp, releaseApp} from '../../../helpers/app';
import {Connection} from "mysql2/promise";
import {bootstrapTestRedis, releaseTestRedis} from "../../../helpers/redis";
import {ExplorerService, QuestionStatus} from "../../../../src";
import "../../../../src/plugins/queue/explorer-high-concurrent-queue";
import "../../../../src/plugins/queue/explorer-low-concurrent-queue";
import {DateTime} from "luxon";

let explorerService: ExplorerService, conn: Connection;

beforeAll(bootstrapTestDatabase);
beforeAll(bootstrapTestRedis);
beforeAll(bootstrapApp);
beforeAll(async () => {
  explorerService = getTestApp().app.explorerService;
  conn = await getTestDatabase().createConnection();
});
afterAll(releaseApp);
afterAll(releaseTestRedis);
afterAll(releaseTestDatabase);

describe('create a new question', () => {

  beforeEach(async () => {
    await conn.query(`DELETE FROM explorer_questions WHERE 1 = 1;`);
  });

  test('tikv only query should push to high concurrent queue', async () => {
    const app = getTestApp().app;
    const questionToSQL = jest.spyOn(app.botService, 'questionToSQL').mockImplementation(async (template, question, context) => {
      return "SELECT COUNT(*) FROM github_events WHERE repo_name = 'pingcap/tidb'";
    });

    const question = await explorerService.newQuestion(conn, 1, "Mini256", "How many events are there in TiDB?");
    expect(question).toEqual({
      id: expect.any(String),
      hash: expect.any(String),
      title: "How many events are there in TiDB?",
      queryHash: expect.any(String),
      querySQL: "SELECT COUNT(*) FROM `github_events` WHERE `repo_name` = 'pingcap/tidb' LIMIT 10",
      engines: ['tikv'],
      queueJobId: expect.any(String),
      recommended: false,
      hitCache: false,
      status: "waiting",
      userId: 1,
      createdAt: expect.any(Object),
      requestedAt: expect.any(Object)
    });

    questionToSQL.mockRestore();
  });

  test('tiflash query should push to low concurrent queue', async () => {
    const app = getTestApp().app;
    const questionToSQL = jest.spyOn(app.botService, 'questionToSQL').mockImplementation(async (template, question, context) => {
      return "SELECT /*+ READ_FROM_STORAGE(tiflash[ge]) */ COUNT(*) FROM github_events ge";
    });
    const getStorageEnginesFromPlan = jest.spyOn(app.explorerService, 'getStorageEnginesFromPlan').mockImplementation((steps) => {
      return ['tiflash'];
    });

    const question = await explorerService.newQuestion(conn, 1, "Mini256", "How many events are there?");
    expect(question).toEqual({
      id: expect.any(String),
      hash: expect.any(String),
      title: "How many events are there?",
      queryHash: expect.any(String),
      querySQL: "SELECT COUNT(*) FROM `github_events` AS `ge` LIMIT 10",
      engines: ['tiflash'],
      queueJobId: expect.any(String),
      recommended: false,
      hitCache: false,
      status: "waiting",
      userId: 1,
      createdAt: expect.any(Object),
      requestedAt: expect.any(Object)
    });

    questionToSQL.mockRestore();
    getStorageEnginesFromPlan.mockRestore();
  });

  test('limit too many question in past hour', async () => {
    const userId = 1;
    const now = DateTime.now().toSQL();
    const records = [
      ["9ca8e457-8986-11ed-990b-029f9ad85623", "hash1", "Question 1", "query_hash1", "SELECT 1", "[\"tikv\"]", "job_id_1", 0, 0, QuestionStatus.Success, userId, now, now],
      ["275ee9f0-8987-11ed-990b-029f9ad85624", "hash2", "Question 2", "query_hash2", "SELECT 2", "[\"tiflash\"]", "job_id_2", 0, 0, QuestionStatus.Error, userId, now, now],
      ["2cfa5a28-8987-11ed-990b-029f9ad85625", "hash3", "Question 3", "query_hash3", "SELECT 3", "[\"tikv\"]", "job_id_3", 0, 0, QuestionStatus.Success, userId, now, now],
    ];

    records.map(async (record) => {
      await conn.query(`
        INSERT INTO explorer_questions (
            id, hash, title, query_hash, query_sql, engines, queue_job_id, recommended, hit_cache, status, user_id, created_at, requested_at
        ) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, record);
    });

    const app = getTestApp().app;
    const questionToSQL = jest.spyOn(app.botService, 'questionToSQL').mockImplementation(async (template, question, context) => {
      return "SELECT COUNT(*) FROM github_events WHERE repo_name = 'pingcap/tidb'";
    });

    expect(() => explorerService.newQuestion(conn, userId, "no-trusted-user", "How many events are there in TiDB?"))
      .rejects
      .toThrowError("Too many questions in the past hour");
    expect(questionToSQL).not.toHaveBeenCalled();

    questionToSQL.mockRestore();
  });

  test('limit too many question on going', async () => {
    const userId = 1;
    const now = DateTime.now().toSQL();
    const records = [
      ["9ca8e457-8986-11ed-990b-029f9ad85623", "hash1", "Question 1", "query_hash1", "SELECT 1", "[\"tikv\"]", "job_id_1", 0, 0, QuestionStatus.Running, userId, now, now],
      ["275ee9f0-8987-11ed-990b-029f9ad85624", "hash2", "Question 2", "query_hash2", "SELECT 2", "[\"tiflash\"]", "job_id_2", 0, 0, QuestionStatus.Waiting, userId, now, now],
    ];

    records.map(async (record) => {
      await conn.query(`
        INSERT INTO explorer_questions (
            id, hash, title, query_hash, query_sql, engines, queue_job_id, recommended, hit_cache, status, user_id, created_at, requested_at
        ) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, record);
    });

    const app = getTestApp().app;
    const questionToSQL = jest.spyOn(app.botService, 'questionToSQL').mockImplementation(async (template, question, context) => {
      return "SELECT COUNT(*) FROM github_events WHERE repo_name = 'pingcap/tidb'";
    });

    expect(() => explorerService.newQuestion(conn, 1, "no-trusted-user", "How many events are there in TiDB?"))
      .rejects
      .toThrowError("Too many questions in waiting or running");
    expect(questionToSQL).not.toHaveBeenCalled();

    questionToSQL.mockRestore();
  });

  afterEach(async () => {
    await conn.query(`DELETE FROM explorer_questions WHERE 1 = 1;`);
  });

});
