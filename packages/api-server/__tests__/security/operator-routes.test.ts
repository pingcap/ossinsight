import Fastify from 'fastify';
import fp from 'fastify-plugin';
import {registerOperatorRoutes} from '../../src/utils/http/operator-routes';
import {registerRequestAudit} from '../../src/utils/http/request-audit';
import rateLimit from '../../src/plugins/rate-limit';

test('new and nested operational routes inherit authentication, audit identity and cache controls', async () => {
  const app = Fastify();
  const token = 'synthetic-operator-scope-key-'.repeat(2);
  const action = jest.fn(async request => ({actor: request.securityActor}));
  registerRequestAudit(app);
  app.get('/healthy', async () => ({ok: true}));
  await registerOperatorRoutes(app, token, async operations => {
    operations.get('/future-operator-job', {config: {operatorOnly: false}}, action);
    await operations.register(async nested => {nested.post('/nested/operation', action);});
  });
  try {
    for (const method of ['GET', 'HEAD'] as const) {
      for (const headers of [{}, {authorization: 'Bearer forged'}, {'x-user-id': 'admin', 'x-forwarded-for': '127.0.0.1'}]) {
        const response = await app.inject({method, url: '/future-operator-job', headers});
        expect(response.statusCode).toBe(401);
        expect(response.headers['cache-control']).toBe('no-store');
        expect(response.headers['cdn-cache-control']).toBe('no-store');
      }
    }
    expect((await app.inject({method: 'POST', url: '/nested/operation'})).statusCode).toBe(401);
    expect(action).not.toHaveBeenCalled();
    const accepted = await app.inject({method: 'POST', url: '/nested/operation', headers: {authorization: `Bearer ${token}`}});
    expect(accepted.statusCode).toBe(200);
    expect(accepted.json().actor).toMatch(/^operator:[a-f0-9]{12}$/);
    expect(action).toHaveBeenCalledTimes(1);
    expect((await app.inject('/healthy')).statusCode).toBe(200);
  } finally {await app.close();}
});

test('a future operator endpoint survives public quota exhaustion only after authentication', async () => {
  const app = Fastify();
  const token = 'synthetic-operator-quota-key-'.repeat(2);
  let count = 0;
  const redis = {defineCommand: jest.fn(), eval: jest.fn(async () => [++count, 3600000])};
  app.decorate('config', {PUBLIC_API_HOURLY_RATE_LIMIT: 1, OPERATIONS_TOKEN: token});
  app.decorate('redis', redis);
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  await app.register(fp(async () => {}, {name: '@ossinsight/redis'}));
  registerRequestAudit(app);
  await app.register(rateLimit);
  app.get('/public', async () => 'public');
  await registerOperatorRoutes(app, token, async operations => {
    operations.get('/future-operator-job', async () => 'operator result');
  });
  try {
    expect((await app.inject('/public')).statusCode).toBe(200);
    expect((await app.inject('/public')).statusCode).toBe(429);
    expect((await app.inject('/future-operator-job')).statusCode).toBe(401);
    expect((await app.inject({url: '/future-operator-job', headers: {authorization: 'Bearer wrong'}})).statusCode).toBe(401);
    expect((await app.inject({url: '/future-operator-job', headers: {authorization: `Bearer ${token}`}})).statusCode).toBe(200);
    expect(redis.eval).toHaveBeenCalledTimes(2);
  } finally {await app.close();}
});
