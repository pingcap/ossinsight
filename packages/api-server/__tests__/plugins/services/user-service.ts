import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../../helpers/db';
import {bootstrapApp, getTestApp, releaseApp} from '../../helpers/app';
import {Connection, ResultSetHeader} from "mysql2/promise";
import { ProviderType, UserRole, UserService } from "../../../src/plugins/services/user-service";
import { Auth0UserInfo } from "../../../src/plugins/services/user-service/auth0";
import {bootstrapTestRedis, releaseTestRedis} from "../../helpers/redis";

let userService: UserService, conn: Connection;

beforeAll(bootstrapTestDatabase);
beforeAll(bootstrapTestRedis);
beforeAll(bootstrapApp);
beforeAll(async () => {
  userService = getTestApp().app.userService;
  conn = await getTestDatabase().createConnection();
});
afterAll(releaseApp);
afterAll(releaseTestRedis);
afterAll(releaseTestDatabase);

describe('get user by id', () => {

  beforeEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

  test('user can be found by id', async () => {
    const [rs] = await conn.query<ResultSetHeader>(`
      INSERT INTO sys_users(name, email_address, email_get_updates, avatar_url, role, created_at, enable)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, ['ossinsight', 'ossinsight@pingcap.com', 1, 'https://github.com/ossinsight.png', UserRole.USER, '2022-01-01 00:00:00', 1]);
    const userId = rs.insertId;
    await conn.query<ResultSetHeader>(`
      INSERT INTO sys_accounts(user_id, provider, provider_account_id, provider_account_login, access_token)
      VALUES (?, ?, ?, ?, ?);
    `, [userId, ProviderType.GITHUB, 1001, 'ossinsight', 'token']);

    const userProfile = await userService.getUserById(1);
    expect(userProfile).toEqual({
      id: userId,
      name: 'ossinsight',
      emailAddress: 'ossinsight@pingcap.com',
      emailGetUpdates: true,
      githubId: 1001,
      githubLogin: 'ossinsight',
      avatarURL: 'https://github.com/ossinsight.png',
      role: UserRole.USER,
      createdAt: expect.any(Date),
      enable: true,
    });
  });

  afterEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

});

describe('get user by github id', () => {

  beforeEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

  test('user can be found by github id', async () => {
    const [rs] = await conn.query<ResultSetHeader>(`
      INSERT INTO sys_users(name, email_address, email_get_updates, avatar_url, role, created_at, enable)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, ['ossinsight', 'ossinsight@pingcap.com', 1, 'https://github.com/ossinsight.png', UserRole.USER, '2022-01-01 00:00:00', 1]);
    const userId = rs.insertId;
    await conn.query<ResultSetHeader>(`
      INSERT INTO sys_accounts(user_id, provider, provider_account_id, provider_account_login, access_token)
      VALUES (?, ?, ?, ?, ?);
    `, [userId, ProviderType.GITHUB, 1001, 'ossinsight', 'token']);

    const userProfile = await userService.getUserByGithubId(1001);
    expect(userProfile).toEqual({
      id: userId,
      name: 'ossinsight',
      emailAddress: 'ossinsight@pingcap.com',
      emailGetUpdates: true,
      githubId: 1001,
      githubLogin: 'ossinsight',
      avatarURL: 'https://github.com/ossinsight.png',
      role: UserRole.USER,
      createdAt: expect.any(Date),
      enable: true,
    });
  });

  afterEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

});

describe('find or create user by account', () => {

  beforeEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

  test('create a new user to bound to the account', async () => {
    const fetchAuth0UserInfoMock = jest
    .spyOn(userService, "fetchAuth0UserInfo")
    .mockImplementation(
      async (domain: string, token: string): Promise<Auth0UserInfo> => {
        return {
          sub: "github|1001",
          nickname: "ossinsight",
          name: "ossinsight",
          picture: "https://github.com/ossinsight.png",
          updated_at: new Date().toUTCString(),
          email: "ossinsight@pingcap.com",
          email_verified: true,
        };
      }
    );
    // const user = {
    //   name: 'ossinsight',
    //   emailAddress: 'ossinsight@pingcap.com',
    //   emailGetUpdates: false,
    //   avatarURL: 'https://github.com/ossinsight.png',
    //   role: UserRole.USER,
    //   createdAt: new Date(),
    //   enable: true,
    // };
    const auth0user = {
      email: "ossinsight@pingcap.com",
      github_id: `1001`,
      github_login: "ossinsight",
      provider: "github",
      sub: "github|1001",
    };
    const account = {
      provider: ProviderType.GITHUB,
      providerAccountId: "1001",
      providerAccountLogin: 'ossinsight',
      accessToken: 'token'
    };
    const userId = await userService.findOrCreateUserByAccount(auth0user, account.accessToken);
    const userProfile = await userService.getUserById(userId);
    fetchAuth0UserInfoMock.mockRestore();
    expect(userProfile).toEqual({
      id: userId,
      name: 'ossinsight',
      emailAddress: 'ossinsight@pingcap.com',
      emailGetUpdates: false,
      githubId: 1001,
      githubLogin: 'ossinsight',
      avatarURL: 'https://github.com/ossinsight.png',
      role: UserRole.USER,
      createdAt: expect.any(Date),
      enable: true,
    });
  });

  test('found a existed users bound to the account', async () => {
    const fetchAuth0UserInfoMock = jest
    .spyOn(userService, "fetchAuth0UserInfo")
    .mockImplementation(
      async (domain: string, token: string): Promise<Auth0UserInfo> => {
        return {
          sub: "github|1001",
          nickname: "ossinsight",
          name: "ossinsight",
          picture: "https://github.com/ossinsight.png",
          updated_at: new Date().toUTCString(),
          email: "ossinsight@pingcap.com",
          email_verified: true,
        };
      }
    );
    // const user = {
    //   name: 'ossinsight',
    //   emailAddress: 'ossinsight@pingcap.com',
    //   emailGetUpdates: false,
    //   avatarURL: 'https://github.com/ossinsight.png',
    //   role: UserRole.USER,
    //   createdAt: new Date(),
    //   enable: true,
    // };
    const auth0user = {
      email: "ossinsight@pingcap.com",
      github_id: `1001`,
      github_login: "ossinsight",
      provider: "github",
      sub: "github|1001",
    };
    const account = {
      provider: ProviderType.GITHUB,
      providerAccountId: "1001",
      providerAccountLogin: 'ossinsight',
      accessToken: 'token'
    };

    // Added a existed user bound to github account.
    await conn.query(`
      INSERT INTO sys_accounts(user_id, provider, provider_account_id, provider_account_login, access_token)
      VALUES (?, ?, ?, ?, ?);
    `, [9999 ,account.provider, account.providerAccountId, account.providerAccountLogin, account.accessToken]);

    const userId = await userService.findOrCreateUserByAccount(auth0user, account.accessToken);
    const userProfile = await userService.getUserById(userId);
    fetchAuth0UserInfoMock.mockRestore();
    expect(userProfile).toEqual({
      id: userId,
      name: 'ossinsight',
      emailAddress: 'ossinsight@pingcap.com',
      emailGetUpdates: false,
      githubId: 1001,
      githubLogin: 'ossinsight',
      avatarURL: 'https://github.com/ossinsight.png',
      role: UserRole.USER,
      createdAt: expect.any(Date),
      enable: true,
    });
  });

  afterEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

});

describe('get email updates', () => {

  beforeEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

  test('get email updates settings', async () => {
    const [rs] = await conn.query<ResultSetHeader>(`
      INSERT INTO sys_users(name, email_address, email_get_updates, avatar_url, role, created_at, enable)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, ['ossinsight', 'ossinsight@pingcap.com', 1, 'https://github.com/ossinsight.png', UserRole.USER, '2022-01-01 00:00:00', 1]);
    const userId = rs.insertId;
    const emailGetUpdates = await userService.getEmailUpdates(userId);
    expect(emailGetUpdates).toBeTruthy();
  });

  afterEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

});

describe('setting email updates', () => {

  beforeEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

  test('setting email updates should work', async () => {
    const [rs] = await conn.query<ResultSetHeader>(`
      INSERT INTO sys_users(name, email_address, email_get_updates, avatar_url, role, created_at, enable)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, ['ossinsight', 'ossinsight@pingcap.com', 1, 'https://github.com/ossinsight.png', UserRole.USER, '2022-01-01 00:00:00', 1]);
    const userId = rs.insertId;

    const emailGetUpdates = await userService.settingEmailUpdates(userId, false);
    expect(emailGetUpdates).toBeFalsy();
  });

  afterEach(async () => {
    await conn.query(`DELETE FROM sys_users WHERE 1 = 1;`);
    await conn.query(`DELETE FROM sys_accounts WHERE 1 = 1;`);
  });

});
