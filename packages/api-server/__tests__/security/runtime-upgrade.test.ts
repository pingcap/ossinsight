import Fastify from 'fastify';
import fp from 'fastify-plugin';
import {createHmac, generateKeyPairSync, sign} from 'crypto';
import {io as connect} from 'socket.io-client';
import WebSocket = require('ws');
import auth0 from '../../src/plugins/auth/auth0';
import sockets from '../../src/plugins/socket.io';
import metrics from '../../src/plugins/metrics';
import {githubAPICounter} from '../../src/metrics';
import {registerRequestAudit} from '../../src/utils/http/request-audit';
import {registerOperationalEndpoints} from '../../src/operations';

const secret = 'synthetic-runtime-upgrade-secret-'.repeat(2);
const origin = 'https://ossinsight.io';
const audience = 'https://api.example.test/ossinsight';
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

async function authenticationApp(key?: string, domain?: string) {
  const app = Fastify();
  app.decorate('config', {AUTH0_SECRET: key, AUTH0_DOMAIN: domain, AUTH0_AUDIENCE: audience});
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  registerRequestAudit(app);
  await app.register(auth0);
  app.get('/private', {preValidation: app.authenticate}, async request => ({actor: request.securityActor}));
  return app;
}

test('JWT verification rejects unsigned, expired and unsupported critical-header tokens', async () => {
  const app = await authenticationApp(secret);
  const claims = {sub: 'github|7', aud: audience, exp: Math.floor(Date.now() / 1000) + 60};
  const token = (header: object, payload = claims) => {
    const data = `${encode(header)}.${encode(payload)}`;
    return `${data}.${createHmac('sha256', secret).update(data).digest('base64url')}`;
  };
  try {
    for (const value of [
      `${encode({alg: 'none'})}.${encode(claims)}.`,
      token({alg: 'HS256', crit: ['unsupported'], unsupported: true}),
      token({alg: 'HS256'}, {...claims, exp: 1}),
    ]) {
      expect((await app.inject({url: '/private', headers: {authorization: `Bearer ${value}`}})).statusCode).toBe(401);
    }
    const response = await app.inject({url: '/private', headers: {authorization: `Bearer ${token({alg: 'HS256'})}`}});
    expect(response.statusCode).toBe(200);
    expect(response.json().actor).toBe('auth0:github|7');
  } finally { await app.close(); }
});

test('a public RSA verification key cannot be reused as an HMAC signing secret', async () => {
  const {publicKey, privateKey} = generateKeyPairSync('rsa', {modulusLength: 2048});
  const pem = publicKey.export({format: 'pem', type: 'spki'}).toString();
  const issuer = 'https://issuer.example.test/';
  const fetchKeys = jest.spyOn(globalThis, 'fetch').mockImplementation(async url => {
    expect(String(url)).toBe(`${issuer}.well-known/jwks.json`);
    return Response.json({keys: [{...publicKey.export({format: 'jwk'}), kid: 'test-key', alg: 'RS256', use: 'sig'}]});
  });
  const app = await authenticationApp(undefined, issuer);
  const payload = encode({sub: 'github|7', aud: audience, iss: issuer, exp: Math.floor(Date.now() / 1000) + 60});
  const forgedData = `${encode({alg: 'HS256'})}.${payload}`;
  const forged = `${forgedData}.${createHmac('sha256', pem).update(forgedData).digest('base64url')}`;
  const validData = `${encode({alg: 'RS256', kid: 'test-key'})}.${payload}`;
  const valid = `${validData}.${sign('RSA-SHA256', Buffer.from(validData), privateKey).toString('base64url')}`;
  try {
    expect((await app.inject({url: '/private', headers: {authorization: `Bearer ${forged}`}})).statusCode).toBe(401);
    expect(fetchKeys).not.toHaveBeenCalled();
    expect((await app.inject({url: '/private', headers: {authorization: `Bearer ${valid}`}})).statusCode).toBe(200);
    expect(fetchKeys).toHaveBeenCalledTimes(1);
  } finally { await app.close(); fetchKeys.mockRestore(); }
});

test('a PEM public key cannot be configured as the symmetric Auth0 client secret', async () => {
  const {publicKey} = generateKeyPairSync('rsa', {modulusLength: 2048});
  const pem = publicKey.export({format: 'pem', type: 'spki'}).toString();
  await expect(authenticationApp(pem)).rejects.toThrow('AUTH0_SECRET must be a symmetric client secret');
});

async function socketApp() {
  const app = Fastify();
  const quota = jest.fn().mockResolvedValue([1, 3600000]);
  const query = jest.fn().mockResolvedValue({data: [{total: 7}], fields: []});
  app.decorate('config', {PUBLIC_API_HOURLY_RATE_LIMIT: 100});
  app.decorate('allowedOrigins', [origin]);
  app.decorate('redis', {eval: quota});
  app.decorate('queryRunner', {query});
  await app.register(sockets);
  const url = await app.listen({host: '127.0.0.1', port: 0});
  return {app, quota, query, url};
}

test('real websocket queries retain origin checks, shared quotas, and graceful shutdown', async () => {
  const {app, quota, query, url} = await socketApp();
  const client = connect(url, {transports: ['websocket'], extraHeaders: {origin}, reconnection: false});
  try {
    await new Promise<void>((resolve, reject) => {client.once('connect', resolve); client.once('connect_error', reject);});
    const result = new Promise<any>(resolve => client.once('/q/events-total?qid=upgrade', resolve));
    client.emit('q', {query: 'events-total', qid: 'upgrade', params: {}, excludeMeta: true});
    expect((await result).payload).toEqual({data: [{total: 7}]});
    expect(query).toHaveBeenCalledTimes(1);
    expect(quota).toHaveBeenCalledTimes(2);
    const disconnected = new Promise<void>(resolve => client.once('disconnect', () => resolve()));
    await app.close();
    await disconnected;
  } finally {client.disconnect(); await app.close();}
});

test.each(['https://untrusted.example', undefined])('websocket connections reject untrusted origin %s', async rejectedOrigin => {
  const {app, quota, query, url} = await socketApp();
  const client = connect(url, {transports: ['websocket'], extraHeaders: rejectedOrigin ? {origin: rejectedOrigin} : {}, reconnection: false});
  try {
    await new Promise<void>((resolve, reject) => {client.once('connect_error', () => resolve()); client.once('connect', () => reject(new Error('Unexpected connection')));});
    expect(quota).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  } finally {client.disconnect(); await app.close();}
});

test('shutdown also closes Engine.IO transports that have not joined a namespace', async () => {
  const {app, url} = await socketApp();
  const client = new WebSocket(url.replace('http:', 'ws:') + '/socket.io/?EIO=4&transport=websocket', {headers: {origin}});
  try {
    await new Promise<void>((resolve, reject) => {client.once('message', () => resolve()); client.once('error', reject);});
    const closed = new Promise<void>(resolve => client.once('close', () => resolve()));
    await app.close();
    await closed;
  } finally {client.terminate(); await app.close();}
});

test('upgraded metrics include application counters and still require operator authentication', async () => {
  const previousInstance = process.env.NODE_APP_INSTANCE;
  process.env.NODE_APP_INSTANCE = '0';
  const app = Fastify();
  await app.register(fp(async () => {}, {name: '@fastify/env'}));
  app.decorate('config', {OPERATIONS_TOKEN: secret});
  app.decorate('swagger', () => ({swagger: '2.0'}));
  registerRequestAudit(app);
  await app.register(metrics);
  app.get('/measured-public-route', async () => ({ok: true}));
  await registerOperationalEndpoints(app);
  githubAPICounter.inc({api: 'runtime-upgrade', statusCode: 200});
  try {
    expect((await app.inject('/metrics')).statusCode).toBe(401);
    expect((await app.inject('/measured-public-route')).statusCode).toBe(200);
    const response = await app.inject({url: '/metrics', headers: {authorization: `Bearer ${secret}`}});
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('ossinsight_api_gh_api_req_total{api="runtime-upgrade",statusCode="200"} 1');
    expect(response.body).toMatch(/http_request_duration_seconds_count\{[^\n]*route="\/measured-public-route"[^\n]*\} 1/);
    expect(response.headers['cache-control']).toBe('no-store');
    expect((await app.inject('/docs/json')).statusCode).toBe(401);
    const schema = await app.inject({url: '/docs/json', headers: {authorization: `Bearer ${secret}`}});
    expect(schema.json()).toEqual({swagger: '2.0'});
  } finally {
    await app.close();
    if (previousInstance === undefined) delete process.env.NODE_APP_INSTANCE;
    else process.env.NODE_APP_INSTANCE = previousInstance;
  }
});
