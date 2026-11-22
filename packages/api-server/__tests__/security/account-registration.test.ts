import Fastify from 'fastify';
import Axios from 'axios';
import {UserService} from '../../src/plugins/services/user-service';

const identity = {sub: 'github|123', email: 'fixture@example.test', provider: 'github', github_login: 'fixture'};
const profile = {sub: identity.sub, name: 'Fixture', email: identity.email, picture: 'https://example.test/avatar', nickname: 'fixture', updated_at: '', email_verified: true};
const uniqueIndex = ['provider', 'provider_account_id'].map(columnName => ({indexName: 'unique_identity', columnName, prefixLength: null}));

function fixture(options: {binding?: any[]; indexes?: any[]; error?: number; winningId?: number} = {}) {
  let binding = options.binding || [];
  const connection = {
    query: jest.fn(async (sql: string) => {
      if (sql.startsWith('SELECT')) return [binding];
      if (sql.includes('INSERT INTO sys_users')) return [{insertId: 99}];
      if (sql.includes('INSERT INTO sys_accounts') && options.error) throw Object.assign(new Error('private SQL values'), {errno: options.error});
      return [{}];
    }),
    commit: jest.fn(async () => {}),
    rollback: jest.fn(async () => {if (options.winningId) binding = [{id: options.winningId, userId: options.winningId}];}),
    release: jest.fn(),
  };
  const pool = {
    query: jest.fn(async (sql: string) => [sql.includes('information_schema.statistics') ? options.indexes || uniqueIndex : binding]),
    getConnection: jest.fn(async () => connection),
  };
  const service = new UserService({AUTH0_DOMAIN: 'fixture.auth0.com'} as any, Fastify().log, pool as any);
  const fetch = jest.spyOn(service, 'fetchAuth0UserInfo').mockImplementation(async () => {
    expect(pool.getConnection).not.toHaveBeenCalled();
    return profile;
  });
  return {service, pool, connection, fetch};
}

afterEach(() => jest.restoreAllMocks());

test('existing identities avoid profile fetches and creation transactions', async () => {
  const f = fixture({binding: [{id: 7, userId: 7}]});
  expect(await f.service.findOrCreateUserByAccount(identity, 'synthetic-token')).toBe(7);
  expect(f.fetch).not.toHaveBeenCalled();
  expect(f.pool.getConnection).not.toHaveBeenCalled();
});

test.each([{binding: [{id: null, userId: 7}]}, {binding: [{id: 7, userId: 7}, {id: 8, userId: 8}]}])('ambiguous or orphaned binding %# cannot create a replacement identity', async ({binding}) => {
  const f = fixture({binding});
  await expect(f.service.findOrCreateUserByAccount(identity, 'synthetic-token')).rejects.toMatchObject({statusCode: 409});
  expect(f.fetch).not.toHaveBeenCalled();expect(f.pool.getConnection).not.toHaveBeenCalled();
});

test.each([
  {indexes: []},
  {indexes: ['user_id', 'provider', 'provider_account_id'].map(columnName => ({indexName: 'wrong', columnName, prefixLength: null}))},
  {indexes: uniqueIndex.map(row => ({...row, prefixLength: 10}))},
])('missing, wrong or prefix-only identity constraint %# prevents registration', async ({indexes}) => {
  const f = fixture({indexes});
  await expect(f.service.findOrCreateUserByAccount(identity, 'synthetic-token')).rejects.toMatchObject({statusCode: 503});
  expect(f.fetch).not.toHaveBeenCalled();expect(f.pool.getConnection).not.toHaveBeenCalled();
});

test.each([1062, 1213, 9007])('a concurrent conflict %s rolls back the provisional user and returns the committed winner', async error => {
  const f = fixture({error, winningId: 42});
  expect(await f.service.findOrCreateUserByAccount(identity, 'synthetic-token')).toBe(42);
  expect(f.connection.rollback).toHaveBeenCalledTimes(1);
  expect(f.connection.commit).not.toHaveBeenCalled();
  expect(f.connection.release).toHaveBeenCalledTimes(1);
  expect(f.fetch).toHaveBeenCalledTimes(1);
});

test('retries are bounded and cannot disclose raw database exceptions', async () => {
  const f = fixture({error: 1213});
  await expect(f.service.findOrCreateUserByAccount(identity, 'synthetic-token')).rejects.toMatchObject({statusCode: 503, message: 'Account registration is busy, please retry.'});
  expect(f.connection.rollback).toHaveBeenCalledTimes(3);
  expect(f.fetch).toHaveBeenCalledTimes(1);
});

test('profile identity must match the verified subject before any creation transaction', async () => {
  const f = fixture();f.fetch.mockResolvedValue({...profile, sub: 'github|999'});
  await expect(f.service.findOrCreateUserByAccount(identity, 'synthetic-token')).rejects.toMatchObject({statusCode: 401});
  expect(f.pool.getConnection).not.toHaveBeenCalled();
});

test.each(['github|', 'github|1|2', 'x'.repeat(21) + '|1', 'github|' + 'x'.repeat(129)])('malformed subject %s is rejected before database access', async sub => {
  const f = fixture();
  await expect(f.service.findOrCreateUserByAccount({...identity, sub}, 'synthetic-token')).rejects.toMatchObject({statusCode: 401});
  expect(f.pool.query).not.toHaveBeenCalled();
});

test('userinfo has a deadline, cannot redirect its bearer token and sanitizes transport errors', async () => {
  const service = new UserService({} as any, Fastify().log, {} as any);
  const get = jest.spyOn(Axios, 'get').mockRejectedValue(new Error('Authorization: Bearer private-secret'));
  await expect(service.fetchAuth0UserInfo('fixture.auth0.com', 'synthetic-token')).rejects.toMatchObject({statusCode: 502, message: 'Unable to load account profile.'});
  expect(get).toHaveBeenCalledWith('https://fixture.auth0.com/userinfo', expect.objectContaining({timeout: 5000, maxRedirects: 0, maxContentLength: 65536}));
});
