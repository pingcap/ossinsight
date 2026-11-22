import Fastify from 'fastify';
import fp from 'fastify-plugin';
import {createHmac} from 'crypto';
import auth0 from '../../src/plugins/auth/auth0';
import {registerRequestAudit} from '../../src/utils/http/request-audit';
import fastifyEnv from '@fastify/env';
import {APIServerEnvSchema} from '../../src/env';

const secret = 'synthetic-audience-isolation-secret-'.repeat(2);
const audience = 'https://api.example.test/ossinsight';
const issuer = 'https://tenant.example.test/';
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const claims = () => ({sub: 'github|17', iss: issuer, aud: audience, azp: 'web-client', exp: Math.floor(Date.now() / 1000) + 60});
function signed(payload: object) {
  const data = `${encode({alg: 'HS256'})}.${encode(payload)}`;
  return `${data}.${createHmac('sha256', secret).update(data).digest('base64url')}`;
}

async function server(expectedAudience: string | null = audience) {
  const app = Fastify();
  app.decorate('config', {AUTH0_SECRET: secret, AUTH0_DOMAIN: issuer,
    AUTH0_AUDIENCE: expectedAudience ?? undefined, AUTH0_ALLOWED_CLIENT_IDS: ['web-client']});
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  registerRequestAudit(app);
  await app.register(auth0);
  app.get('/private', {preValidation: app.authenticate}, async request => ({actor: request.securityActor}));
  app.get('/public', async () => ({ok: true}));
  return app;
}

test('a valid signature alone cannot authenticate a token for another audience, issuer or client', async () => {
  const app = await server();
  const mutations = [
    {aud: undefined}, {aud: 'different-api'}, {aud: audience + '/other'}, {aud: []},
    {aud: [issuer + 'userinfo']}, {aud: {audience}}, {aud: [audience, 7]},
    {azp: undefined}, {azp: 'unrelated-client'}, {exp: undefined}, {iss: 'https://other-tenant.example.test/'},
  ];
  try {
    for (const mutation of mutations) {
      const response = await app.inject({url: '/private', headers: {authorization: `Bearer ${signed({...claims(), ...mutation})}`}});
      expect(response.statusCode).toBe(401);
      expect(response.body).not.toContain('auth0:github|17');
    }
    for (const aud of [audience, [audience, issuer + 'userinfo']]) {
      const response = await app.inject({url: '/private', headers: {authorization: `Bearer ${signed({...claims(), aud})}`}});
      expect(response.statusCode).toBe(200);
      expect(response.json().actor).toBe('auth0:github|17');
    }
  } finally {await app.close();}
});

test('missing audience configuration fails closed without disabling anonymous analytics', async () => {
  const app = await server(null);
  try {
    expect((await app.inject('/public')).statusCode).toBe(200);
    const response = await app.inject({url: '/private', headers: {authorization: `Bearer ${signed(claims())}`}});
    expect(response.statusCode).toBe(503);
  } finally {await app.close();}
});

test.each([issuer + 'api/v2/', issuer + 'userinfo'])('the Auth0 service audience %s cannot be reused as our API audience', async value => {
  await expect(server(value)).rejects.toThrow('AUTH0_AUDIENCE must identify this API');
});

test.each([undefined, 'web-client,second-client'])('the real environment loader parses client restrictions %s', async clientIds => {
  const app = Fastify();
  await app.register(fastifyEnv, {confKey: 'config', schema: APIServerEnvSchema, dotenv: false,
    data: {DATABASE_URL: 'mysql://test:test@localhost/test', REDIS_URL: 'redis://localhost', GITHUB_ACCESS_TOKENS: '',
      AUTH0_SECRET: secret, AUTH0_DOMAIN: issuer, AUTH0_AUDIENCE: audience,
      ...(clientIds ? {AUTH0_ALLOWED_CLIENT_IDS: clientIds} : {})}});
  registerRequestAudit(app);
  try {
    await app.register(auth0);
    app.get('/private', {preValidation: app.authenticate}, async () => ({ok: true}));
    const response = await app.inject({url: '/private', headers: {authorization: `Bearer ${signed(claims())}`}});
    expect(response.statusCode).toBe(200);
    if (clientIds) expect(app.config.AUTH0_ALLOWED_CLIENT_IDS).toEqual(['web-client', 'second-client']);
  } finally {await app.close();}
});
