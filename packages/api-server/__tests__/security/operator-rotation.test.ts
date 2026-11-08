import Fastify from 'fastify';
import fp from 'fastify-plugin';
import {AddressInfo} from 'net';
import {Registry} from 'prom-client';
import {createHash} from 'crypto';
import {createOperatorTokenVerifier, OperatorTokenConfig} from '@ossinsight/types/dist/operator-token';
import {operationsCredentials} from '../../src/utils/http/operator-auth';
import {registerOperatorRoutes} from '../../src/utils/http/operator-routes';
import rateLimit from '../../src/plugins/rate-limit';
import {workerOperations} from '../../src/worker/operations';
import {registerOperatorAuth} from '../../../pipeline/src/utils/operator-auth';
import {prefetchOperations} from '../../../prefetch/src/operations';

const current = 'synthetic-current-operator-key-'.repeat(2);
const previous = 'synthetic-previous-operator-key-'.repeat(2);
const start = Date.parse('2030-01-01T00:00:00Z');
const expiry = start + 3600000;
const rotation = () => ({current, previous, previousExpiresAt: new Date(expiry).toISOString()});
const auth = (token: string) => ({authorization: `Bearer ${token}`});
const fingerprint = (token: string) => createHash('sha256').update(token).digest('hex').slice(0, 12);

test('current-only compatibility and bounded bearer input', () => {
  const verify = createOperatorTokenVerifier({current});
  expect(verify(`Bearer ${current}`)).toEqual({status: 'accepted', fingerprint: fingerprint(current)});
  for (const input of [undefined, [], 1, `Basic ${current}`, 'Bearer ', `Bearer ${current} `, 'Bearer ' + 'x'.repeat(513)]) {
    expect(verify(input)).toEqual({status: 'rejected'});
  }
  expect(verify(`Bearer ${previous}`)).toEqual({status: 'rejected'});
});

test('old key expires at the absolute boundary without restart and cannot revive after clock rollback', () => {
  let clock = start;
  const config = rotation();
  const verify = createOperatorTokenVerifier(config, () => clock);
  for (clock of [start, expiry - 1]) {
    expect(verify(`Bearer ${previous}`)).toEqual({status: 'accepted', fingerprint: fingerprint(previous)});
    expect(verify(`Bearer ${current}`)).toEqual({status: 'accepted', fingerprint: fingerprint(current)});
  }
  // Mutable external configuration cannot silently replace the captured policy.
  config.previousExpiresAt = new Date(expiry + 100000).toISOString();
  for (clock of [expiry, expiry + 1, start]) {
    expect(verify(`Bearer ${previous}`)).toEqual({status: 'rejected'});
    expect(verify(`Bearer ${current}`).status).toBe('accepted');
  }
});

test('restart with expired previous key keeps the current key usable; removing old slot revokes immediately', () => {
  for (const config of [rotation(), {current}]) {
    const verify = createOperatorTokenVerifier(config, () => expiry);
    expect(verify(`Bearer ${previous}`).status).toBe('rejected');
    expect(verify(`Bearer ${current}`).status).toBe('accepted');
  }
});

test.each<OperatorTokenConfig>([
  {}, {current: 'short'}, {current: 'x'.repeat(257)}, {current: 'x'.repeat(32) + '\n'},
  {current, previous}, {current, previousExpiresAt: new Date(expiry).toISOString()},
  {...rotation(), previous: current}, {...rotation(), previous: 'short'},
  {...rotation(), previousExpiresAt: ''}, {...rotation(), previousExpiresAt: '2030-02-30T00:00:00Z'},
  {...rotation(), previousExpiresAt: '2030-01-01T01:00:00'},
  {...rotation(), previousExpiresAt: '2030-01-01T01:00:00+00:00'},
  {...rotation(), previousExpiresAt: '2030-01-01T01:00:00.123456Z'},
  {...rotation(), previousExpiresAt: new Date(start + 86400001).toISOString()},
])('invalid configuration fails closed for both keys and cannot age into validity: %#', config => {
  let clock = start;
  const verify = createOperatorTokenVerifier(config, () => clock);
  for (clock of [start, start + 86400000, start + 864000000]) {
    expect(verify(`Bearer ${current}`)).toEqual({status: 'unconfigured'});
    expect(verify(`Bearer ${previous}`)).toEqual({status: 'unconfigured'});
  }
});

test('maximum window and canonical second precision are accepted', () => {
  for (const previousExpiresAt of ['2030-01-02T00:00:00Z', '2030-01-02T00:00:00.000Z']) {
    expect(createOperatorTokenVerifier({current, previous, previousExpiresAt}, () => start)(`Bearer ${previous}`).status).toBe('accepted');
  }
});

test('API scope, quota exemptions, pipeline writes and worker metrics enforce the same deadline', async () => {
  let clock = start;
  const time = jest.spyOn(Date, 'now').mockImplementation(() => clock);
  const api = Fastify();
  const pipeline = Fastify();
  const worker = workerOperations(() => true, rotation());
  const execute = jest.fn(async request => ({actor: request.operatorActor}));
  const redis = {defineCommand: jest.fn(), eval: jest.fn(async () => [2, 3600000])};
  api.decorate('config', {PUBLIC_API_HOURLY_RATE_LIMIT: 1, OPERATIONS_TOKEN: current,
    OPERATIONS_TOKEN_PREVIOUS: previous, OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT: new Date(expiry).toISOString()});
  api.decorate('redis', redis);
  try {
    await api.register(fp(async () => {}, {name: '@fastify/env'}));
    await api.register(fp(async () => {}, {name: '@ossinsight/redis'}));
    await api.register(rateLimit);
    api.get('/public', async () => 'public');
    await registerOperatorRoutes(api, operationsCredentials(api.config), async scope => {
      scope.get('/future-operation', async request => ({actor: request.securityActor}));
    });
    registerOperatorAuth(pipeline, rotation());
    pipeline.get('/', async () => true);
    pipeline.post('/trigger', execute);
    expect((await api.inject('/public')).statusCode).toBe(429);
    for (const instant of [start, expiry - 1, expiry, expiry + 1]) {
      clock = instant;
      for (const token of [current, previous, 'wrong']) {
        const expected = token === current || token === previous && instant < expiry ? 200 : 401;
        const results = await Promise.all([
          api.inject({url: '/future-operation', headers: auth(token)}),
          pipeline.inject({method: 'POST', url: '/trigger', headers: auth(token)}),
          worker.inject({url: '/metrics', headers: auth(token)}),
        ]);
        for (const result of results) {
          expect(result.statusCode).toBe(expected);
          expect(result.headers['cache-control']).toBe('no-store');
        }
        if (expected === 200) {
          expect(results[0].json().actor).toBe(`operator:${fingerprint(token)}`);
          expect(results[1].json().actor).toBe(`pipeline-operator:${fingerprint(token)}`);
        }
      }
    }
    expect(execute).toHaveBeenCalledTimes(6);
    expect(redis.eval).toHaveBeenCalledTimes(1);
    expect((await pipeline.inject('/')).statusCode).toBe(200);
    expect((await worker.inject('/healthy')).statusCode).toBe(200);
  } finally {await Promise.all([api.close(), pipeline.close(), worker.close()]); time.mockRestore();}
});

test('prefetch HTTP metrics rotates without exposing keys and denies expired or absent credentials', async () => {
  let clock = start;
  const time = jest.spyOn(Date, 'now').mockImplementation(() => clock);
  const server = prefetchOperations(new Registry(), {OPERATIONS_TOKEN: current,
    OPERATIONS_TOKEN_PREVIOUS: previous, OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT: new Date(expiry).toISOString()});
  try {
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    for (const instant of [start, expiry]) {
      clock = instant;
      for (const token of [current, previous, 'wrong']) {
        const response = await fetch(`${url}/metrics`, {headers: auth(token)});
        expect(response.status).toBe(token === current || token === previous && instant < expiry ? 200 : 401);
        expect(response.headers.get('cache-control')).toBe('no-store');
        const body = await response.text();
        expect(body).not.toContain(current);
        expect(body).not.toContain(previous);
      }
    }
    expect((await fetch(`${url}/metrics`)).status).toBe(401);
    expect((await fetch(`${url}/other`, {headers: auth(current)})).status).toBe(404);
  } finally {await new Promise<void>(resolve => server.close(() => resolve())); time.mockRestore();}
});
