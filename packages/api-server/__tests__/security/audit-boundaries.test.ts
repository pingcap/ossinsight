import Fastify from 'fastify';
import {registerRequestAudit} from '../../src/utils/http/request-audit';
import {withRequestAudit} from '../../../../apps/web/lib/server/request-audit';
import {registerOperatorRoutes} from '../../src/utils/http/operator-routes';

const secret = 'test-only-operations-secret-'.repeat(2);

test('metrics and API schema require operator credentials even from loopback or spoofed trusted addresses', async () => {
  const app = Fastify();
  registerRequestAudit(app);
  app.get('/healthy', async () => ({ok: true}));
  await registerOperatorRoutes(app, secret, async operations => {
    operations.get('/metrics', async request => ({actor: request.securityActor}));
    operations.get('/docs/json', async request => ({actor: request.securityActor}));
  });
  try {
    for (const url of ['/metrics', '/docs/json']) {
      expect((await app.inject({url})).statusCode).toBe(401);
      expect((await app.inject({url, headers: {'x-forwarded-for': '127.0.0.1', authorization: 'Bearer forged'}})).statusCode).toBe(401);
      const response = await app.inject({url, headers: {authorization: `Bearer ${secret}`}});
      expect(response.statusCode).toBe(200);
      expect(response.json().actor).toMatch(/^operator:[a-f0-9]{12}$/);
    }
    expect((await app.inject({url: '/healthy'})).statusCode).toBe(200);
  } finally { await app.close(); }
});

test('an unconfigured operations token cannot accidentally expose metrics', async () => {
  const app = Fastify();
  registerRequestAudit(app);
  await registerOperatorRoutes(app, undefined, async operations => {
    operations.get('/metrics', async () => 'private metrics');
  });
  try { expect((await app.inject({url: '/metrics'})).statusCode).toBe(503); }
  finally { await app.close(); }
});

test('web auditing redacts request values and exceptions, ignores forged actors, and correlates responses', async () => {
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  try {
    const request = new Request('https://example.test/api/q/one?token=secret-value', {headers: {authorization: 'Bearer secret-token', 'x-user-id': 'admin'}});
    const route = withRequestAudit('GET /api/q/[...query]', async (_request: Request) => {throw new Error('private SQL password=secret-value');});
    const response = await route(request);
    expect(response.status).toBe(500);
    const body = await response.json();
    const record = JSON.parse(log.mock.calls[0][0]);
    expect(record).toMatchObject({actor: 'public', route: 'GET /api/q/[...query]', statusCode: 500});
    expect(record.requestId).toBe(response.headers.get('X-Request-ID'));
    expect(body.requestId).toBe(record.requestId);
    expect(JSON.stringify([record, body])).not.toMatch(/secret-value|secret-token|password|admin/);
  } finally { log.mockRestore(); }
});

test('audited redirects remain valid and collection responses cannot outlive visibility revocation in a CDN', async () => {
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  try {
    const redirect = await withRequestAudit('GET /api/avatar/[owner]', async () => Response.redirect('https://example.test/image'))();
    expect(redirect.status).toBe(302);
    expect(redirect.headers.get('Location')).toBe('https://example.test/image');
    const response = await withRequestAudit('GET /collections/api', async () => Response.json([], {headers: {'Vercel-CDN-Cache-Control': 'max-age=3600'}}))();
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe('no-store');
  } finally { log.mockRestore(); }
});

test('audit principals are assigned only after real JWT signature verification', async () => {
  const {createHmac} = require('crypto');
  const fp = require('fastify-plugin');
  const auth0 = require('../../src/plugins/auth/auth0').default;
  const app = Fastify();
  app.decorate('config', {AUTH0_SECRET: secret, AUTH0_AUDIENCE: 'synthetic-api-audience'});
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  registerRequestAudit(app);
  await app.register(auth0);
  const actors: Array<string | null | undefined> = [];
  app.addHook('onResponse', async request => { actors.push(request.securityActor); });
  app.get('/privileged', {preValidation: app.authenticate}, async request => ({actor: request.securityActor}));
  const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64url');
  const claims = Buffer.from(JSON.stringify({sub: 'github|7', aud: 'synthetic-api-audience', exp: Math.floor(Date.now() / 1000) + 60})).toString('base64url');
  const unsigned = `${header}.${claims}`;
  const signature = createHmac('sha256', secret).update(unsigned).digest('base64url');
  try {
    const rejected = await app.inject({url: '/privileged', headers: {authorization: `Bearer ${unsigned}.forged`, 'x-user-id': 'admin'}});
    expect(rejected.statusCode).toBe(401);
    expect(actors[0]).toBeNull();
    const accepted = await app.inject({url: '/privileged', headers: {authorization: `Bearer ${unsigned}.${signature}`}});
    expect(accepted.statusCode).toBe(200);
    expect(accepted.json().actor).toBe('auth0:github|7');
  } finally { await app.close(); }
});

test('query responses cannot bypass later visibility checks through browser or CDN caching', async () => {
  const app = Fastify();
  registerRequestAudit(app);
  app.get('/q/public', async (_request, reply) => reply.header('Expires', new Date(Date.now() + 3600000).toUTCString()).send({data: []}));
  try {
    const response = await app.inject({url: '/q/public'});
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers.expires).toBeUndefined();
  } finally { await app.close(); }
});

test('framework control-flow exceptions are preserved instead of becoming cacheable 500 responses', async () => {
  const signal = new Error('framework redirect');
  const handler = withRequestAudit('GET /route', async () => {throw signal;}, error => {if (error === signal) throw error;});
  await expect(handler()).rejects.toBe(signal);
});
