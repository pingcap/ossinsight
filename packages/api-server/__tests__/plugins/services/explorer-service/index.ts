import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';
import {bootstrapApp, getTestApp, releaseApp} from '../../../helpers/app';
import {Connection} from "mysql2/promise";
import {bootstrapTestRedis, releaseTestRedis} from "../../../helpers/redis";
import {ExplorerService} from "../../../../src";
import "../../../../src/plugins/queue/explorer-high-concurrent-queue";
import "../../../../src/plugins/queue/explorer-low-concurrent-queue";
import {Job} from "bullmq";

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
    const addToHighQueue = jest.spyOn(app.explorerHighConcurrentQueue, 'add').mockImplementation(async (name, data, opts) => {
      const job = new Job(app.explorerHighConcurrentQueue, name, data, opts, "1");
      return job;
    });

    const question = await explorerService.newQuestion(conn, 1, "How many events are there in TiDB?");
    expect(question).toEqual({
      id: expect.any(String),
      title: "How many events are there in TiDB?",
      queryHash: expect.any(String),
      querySQL: "SELECT COUNT(*) FROM `github_events` WHERE `repo_name` = 'pingcap/tidb' LIMIT 10",
      engines: ['tikv'],
      queueJobId: "1",
      recommended: false,
      status: "waiting",
      userId: 1,
      createdAt: expect.any(Object)
    });

    questionToSQL.mockRestore();
    addToHighQueue.mockRestore();
  });

  test('tiflash query should push to low concurrent queue', async () => {
    const app = getTestApp().app;
    const questionToSQL = jest.spyOn(app.botService, 'questionToSQL').mockImplementation(async (template, question, context) => {
      return "SELECT /*+ READ_FROM_STORAGE(tiflash[ge]) */ COUNT(*) FROM github_events ge";
    });
    const addToLowQueue = jest.spyOn(app.explorerLowConcurrentQueue, 'add').mockImplementation(async (name, data, opts) => {
      const job = new Job(app.explorerLowConcurrentQueue, name, data, opts, "2");
      return job;
    });

    const getStorageEnginesFromPlan = jest.spyOn(app.explorerService, 'getStorageEnginesFromPlan').mockImplementation((steps) => {
      return ['tiflash'];
    });

    const question = await explorerService.newQuestion(conn, 1, "How many events are there?");
    expect(question).toEqual({
      id: expect.any(String),
      title: "How many events are there?",
      queryHash: expect.any(String),
      querySQL: "SELECT COUNT(*) FROM `github_events` AS `ge` LIMIT 10",
      engines: ['tiflash'],
      queueJobId: "2",
      recommended: false,
      status: "waiting",
      userId: 1,
      createdAt: expect.any(Object)
    });

    questionToSQL.mockRestore();
    addToLowQueue.mockRestore();
    getStorageEnginesFromPlan.mockRestore();
  });

  afterEach(async () => {
    await conn.query(`DELETE FROM explorer_questions WHERE 1 = 1;`);
  });

});
