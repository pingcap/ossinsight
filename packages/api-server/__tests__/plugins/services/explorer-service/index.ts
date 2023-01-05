import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../../helpers/db';
import {bootstrapApp, getTestApp, releaseApp} from '../../../helpers/app';
import {Connection} from "mysql2/promise";
import {bootstrapTestRedis, releaseTestRedis} from "../../../helpers/redis";
import {ExplorerService} from "../../../../src";
import "../../../../src/plugins/queue/explorer-high-concurrent-queue";
import "../../../../src/plugins/queue/explorer-low-concurrent-queue";
import {ChartNames} from "../../../../src/plugins/services/bot-service/types";

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
    const questionToAnswer = jest.spyOn(app.botService, 'questionToAnswer').mockImplementation(async (template, question) => {
      return {
        sql: "SELECT COUNT(*) FROM github_events WHERE repo_name = 'pingcap/tidb'",
        chart: {
          chartName: ChartNames.TABLE,
          columns: ['COUNT(*)']
        },
        questions: []
      }
    });

    const question = await explorerService.newQuestion(conn, 1, "Mini256", "How many events are there in TiDB?");
    expect(question).toEqual({
      id: expect.any(String),
      hash: expect.any(String),
      title: "How many events are there in TiDB?",
      queryHash: expect.any(String),
      querySQL: "SELECT COUNT(*) FROM `github_events` WHERE `repo_name` = 'pingcap/tidb' LIMIT 200",
      engines: ['tikv'],
      queueName: "explorer_high_concurrent_queue",
      queueJobId: expect.any(String),
      recommended: false,
      hitCache: false,
      status: "waiting",
      userId: 1,
      chart: {
        chartName: "Table",
        columns: ["COUNT(*)"]
      },
      createdAt: expect.any(Object),
      requestedAt: expect.any(Object),
      recommendedQuestions: []
    });

    questionToAnswer.mockRestore();
  });

  test('tiflash query should push to low concurrent queue', async () => {
    const app = getTestApp().app;
    const questionToAnswer = jest.spyOn(app.botService, 'questionToAnswer').mockImplementation(async (template, question) => {
      return {
        sql: "SELECT /*+ READ_FROM_STORAGE(tiflash[ge]) */ COUNT(*) FROM github_events ge",
        chart: {
          chartName: ChartNames.TABLE,
          columns: ['COUNT(*)']
        },
        questions: []
      }
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
      querySQL: "SELECT COUNT(*) FROM `github_events` AS `ge` LIMIT 200",
      engines: ['tiflash'],
      queueName: "explorer_low_concurrent_queue",
      queueJobId: expect.any(String),
      recommended: false,
      hitCache: false,
      status: "waiting",
      userId: 1,
      chart: {
        chartName: "Table",
        columns: ["COUNT(*)"]
      },
      createdAt: expect.any(Object),
      requestedAt: expect.any(Object),
      recommendedQuestions: []
    });

    questionToAnswer.mockRestore();
    getStorageEnginesFromPlan.mockRestore();
  });

  afterEach(async () => {
    await conn.query(`DELETE FROM explorer_questions WHERE 1 = 1;`);
  });

});
