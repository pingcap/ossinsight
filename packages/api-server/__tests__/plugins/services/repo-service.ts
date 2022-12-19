import {bootstrapTestDatabase, releaseTestDatabase, TiDBDatabase} from '../../helpers/db';
import {bootstrapApp, StartedApp} from '../../helpers/app';
import '../../../src/plugins/services/repo-service';
import {RepoService, SubscribedRepo} from "../../../src/plugins/services/repo-service";
import {Connection} from "mysql2/promise";
import {APIError} from "../../../src/utils/error";
import {bootstrapTestRedis, releaseTestRedis} from "../../helpers/redis";

let db: TiDBDatabase, app: StartedApp, conn: Connection, repoService: RepoService;

beforeAll(async () => {
  db = await bootstrapTestDatabase();
  await bootstrapTestRedis();
  app = await bootstrapApp();
  repoService = app.app.repoService;
  conn = await db.createConnection();
});

describe('subscribe repo', () => {

  beforeEach(async () => {
    await conn.query('DELETE FROM sys_subscribed_repos WHERE 1 = 1;');
    // Repo pingcap/tidb has been subscribed by user 1.
    await conn.query(`
        INSERT INTO sys_subscribed_repos(user_id, repo_id, subscribed, subscribed_at)
        VALUES (?, ?, 1, NOW());
    `, [1, 41986369]);
  });

  test.each([
    ['new subscribe should work', 1, 48833910, 'tikv', 'tikv'],
    ['resubscribe should work', 1, 41986369, 'pingcap', 'tidb']
  ])('%s', async (name: string, userId: number, repoId: number, owner: string, repo: string) => {
    const getRepoIdMethod = jest.spyOn(repoService, 'getRepoId').mockImplementation(async () => {
      return repoId;
    });
    await repoService.subscribeRepo(userId, owner, repo);
    expect(getRepoIdMethod).toBeCalled();
    await expectSubscribed(conn, userId, repoId, 1);

    getRepoIdMethod.mockRestore();
    await conn.query('DELETE FROM sys_subscribed_repos WHERE user_id = ?;', [userId]);
  });

  afterEach(async () => {
    await conn.query('DELETE FROM sys_subscribed_repos WHERE 1 = 1;');
  });

});

describe('unsubscribe repo', () => {

  beforeEach(async () => {
    await conn.query('DELETE FROM sys_subscribed_repos WHERE 1 = 1;');
    // Repo pingcap/tidb has been subscribed by user 1.
    await conn.query(`
        INSERT INTO sys_subscribed_repos(user_id, repo_id, subscribed, subscribed_at)
        VALUES (?, ?, 1, NOW());
    `, [1, 41986369]);
  });

  test('cancel existed subscription should work', async () => {
    const userId = 1, repoId = 41986369, owner = 'pingcap', repo = 'tidb';
    const getRepoIdMethod = jest.spyOn(repoService, 'getRepoId').mockImplementation(async () => {
      return repoId;
    });

    await repoService.unsubscribeRepo(userId, owner, repo);
    expect(getRepoIdMethod).toBeCalled();
    await expectSubscribed(conn, userId, repoId, 0);

    getRepoIdMethod.mockRestore();
  });

  test('cancel non-existed subscription will fail', async () => {
    const userId = 1, repoId = 48833910, owner = 'tikv', repo = 'tikv';
    const getRepoIdMethod = jest.spyOn(repoService, 'getRepoId').mockImplementation(async () => {
      return repoId;
    });

    await expect(repoService.unsubscribeRepo(userId, owner, repo)).rejects
        .toThrowError(new APIError(409, 'Repo tikv/tikv has not been subscribed by user 1'));

    getRepoIdMethod.mockRestore();
  });

  afterEach(async () => {
    await conn.query('DELETE FROM sys_subscribed_repos WHERE 1 = 1;');
  });

});

describe('get user subscribed repos', () => {

  beforeEach(async () => {
    await conn.query('DELETE FROM sys_subscribed_repos WHERE 1 = 1;');
    await conn.query(`
        INSERT INTO github_repos(repo_id, repo_name, owner_id, owner_login, owner_is_org)
        VALUES ?;
    `, [[
      [41986369, 'pingcap/tidb', 11855343, 'pingcap', 1],
      [167499157, 'pingcap/tiflash', 11855343, 'pingcap', 1],
      [48833910, 'tikv/tikv', 41004122, 'tikv', 1]
    ]]);
    await conn.query(`
        INSERT INTO sys_subscribed_repos(user_id, repo_id, subscribed_at, subscribed)
        VALUES ?;
    `, [[
      [1, 41986369, '2022-01-01 00:00:00', 1],
      [1, 167499157, '2022-01-02 00:00:00', 1],
      [1, 48833910, '2022-01-03 00:00:00', 0],
      [2, 41986369, '2022-01-04 00:00:00', 1],
    ]]);
  });

  test('should not get unsubscribed repo and other users\' subscription', async () => {
    const userId = 1;
    const repos = await repoService.getUserSubscribedRepos(userId);
    expect(repos).toEqual([
      {
        userId: 1,
        repoId: 167499157,
        repoName: 'pingcap/tiflash',
        subscribed: true,
        subscribedAt: expect.any(Date)
      },
      {
        userId: 1,
        repoId: 41986369,
        repoName: 'pingcap/tidb',
        subscribed: true,
        subscribedAt: expect.any(Date)
      }
    ]);
  });

  afterEach(async () => {
    await conn.query('DELETE FROM sys_subscribed_repos WHERE 1 = 1;');
  });

});

afterAll(async () => {
  await conn.end();
  await app.close();
  await releaseTestRedis();
  await releaseTestDatabase();
});

async function expectSubscribed(conn: Connection, userId: number, repoId: number, subscribed: number) {
  const [subscribedRepos] = await conn.query<SubscribedRepo[]>(`
      SELECT subscribed AS subscribed
      FROM sys_subscribed_repos ssr
      WHERE ssr.user_id = ? AND ssr.repo_id = ?;
    `, [userId, repoId]);

  expect(subscribedRepos.length).toBe(1);
  expect(subscribedRepos[0].subscribed).toEqual(subscribed);
}