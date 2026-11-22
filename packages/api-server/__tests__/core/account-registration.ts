import Fastify, {FastifyInstance} from 'fastify';
import mysqlPlugin from '@fastify/mysql';
import {createConnection} from 'mysql2/promise';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../helpers/db';
import {UserService} from '../../src/plugins/services/user-service';

let app: FastifyInstance;
beforeAll(async () => {
  await bootstrapTestDatabase();
  app = Fastify();
  await app.register(mysqlPlugin, {promise: true, uri: getTestDatabase().url(), connectionLimit: 12});
  await app.ready();
});
afterAll(async () => {await app?.close();await releaseTestDatabase();});
afterEach(() => jest.restoreAllMocks());

function serviceFor(id: string) {
  const service = new UserService({AUTH0_DOMAIN: 'fixture.auth0.com'} as any, app.log, app.mysql);
  const identity = {sub: 'github|' + id, email: 'fixture@example.test', provider: 'github', github_login: 'fixture'};
  const profile = {sub: identity.sub, nickname: 'fixture', name: 'Account Race Fixture', picture: 'https://example.test/avatar', email: identity.email, updated_at: '', email_verified: true};
  return {service, identity, profile};
}

async function userCount() {
  const [rows]: any = await app.mysql.query('SELECT COUNT(*) AS total FROM sys_users');
  return Number(rows[0].total);
}

test('six simultaneous first logins commit one user and one provider binding and return the same ID', async () => {
  const {service, identity, profile} = serviceFor('900000001');
  const before = await userCount();
  let arrivals = 0, release!: () => void;
  const gate = new Promise<void>(resolve => {release = resolve;});
  jest.spyOn(service, 'fetchAuth0UserInfo').mockImplementation(async () => {
    if (++arrivals === 6) release();
    await gate;
    return profile;
  });
  try {
    const ids = await Promise.all(Array.from({length: 6}, () => service.findOrCreateUserByAccount(identity, 'synthetic-token')));
    expect(new Set(ids).size).toBe(1);
    expect(await userCount()).toBe(before + 1);
    const [accounts]: any = await app.mysql.query("SELECT user_id FROM sys_accounts WHERE provider='github' AND provider_account_id='900000001'");
    expect(accounts).toEqual([{user_id: ids[0]}]);
  } finally {release();}
});

test('an existing account does not need an external profile request', async () => {
  const {service, identity, profile} = serviceFor('900000004');
  const fetch = jest.spyOn(service, 'fetchAuth0UserInfo').mockResolvedValue(profile);
  const id = await service.findOrCreateUserByAccount(identity, 'synthetic-token');
  fetch.mockClear();fetch.mockRejectedValue(new Error('provider unavailable'));
  expect(await service.findOrCreateUserByAccount(identity, 'synthetic-token')).toBe(id);
  expect(fetch).not.toHaveBeenCalled();
});

test('an orphaned account cannot recreate or reassign its missing user', async () => {
  const {service, identity} = serviceFor('900000002');
  const connection = await app.mysql.getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    await connection.query("INSERT INTO sys_accounts(user_id,provider,provider_account_id) VALUES(2147483000,'github','900000002')");
  } finally {await connection.query('SET FOREIGN_KEY_CHECKS=1');connection.release();}
  const before = await userCount();
  const fetch = jest.spyOn(service, 'fetchAuth0UserInfo');
  await expect(service.findOrCreateUserByAccount(identity, 'synthetic-token')).rejects.toMatchObject({statusCode: 409});
  expect(fetch).not.toHaveBeenCalled();expect(await userCount()).toBe(before);
  const [rows]: any = await app.mysql.query("SELECT user_id FROM sys_accounts WHERE provider='github' AND provider_account_id='900000002'");
  expect(rows).toEqual([{user_id: 2147483000}]);
});

test('missing production identity constraint blocks new registration before any user insert', async () => {
  const {service, identity} = serviceFor('900000003');
  const before = await userCount();
  const fetch = jest.spyOn(service, 'fetchAuth0UserInfo');
  // Only the isolated test fixture's administrator changes schema. The service
  // retains the same restricted application account used by the other tests.
  const administrator = await createConnection(getTestDatabase().rootUrl());
  let dropped = false;
  try {
    await administrator.query('USE ??', [getTestDatabase().database]);
    await administrator.query('ALTER TABLE sys_accounts DROP INDEX index_sa_on_provider_account_id');
    dropped = true;
    await expect(service.findOrCreateUserByAccount(identity, 'synthetic-token')).rejects.toMatchObject({statusCode: 503});
    expect(fetch).not.toHaveBeenCalled();expect(await userCount()).toBe(before);
  } finally {
    try {
      if (dropped) await administrator.query('ALTER TABLE sys_accounts ADD UNIQUE KEY index_sa_on_provider_account_id(provider,provider_account_id)');
    } finally {await administrator.end();}
  }
});
