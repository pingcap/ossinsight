import { getTestDatabase } from './db';
import type { APIServerEnvSchema } from '../../src/env';
import Fastify, { FastifyInstance, LightMyRequestResponse } from 'fastify';
import fp from 'fastify-plugin';
import App from '../../src/app';
import { AddressInfo } from 'net';
import * as path from 'path';
import io from 'socket.io-client';
import { OutgoingHttpHeaders } from 'http';
import { register } from 'prom-client';
import {getTestRedis} from "./redis";

type Schema = (typeof APIServerEnvSchema)['properties']
type Env = {
  [P in keyof Schema]: Schema[P] extends { default: any } ? any | undefined : any
}

let _app: StartedApp | undefined;
let appPromise: Promise<StartedApp> | undefined;

async function createApp () {
  const db = getTestDatabase();
  const redis = getTestRedis();

  // Override process env
  const playgroundDatabaseURL = db.url()
      .replace('executoruser', 'webshelluser')
      .replace('executorpassword', 'webshellpassword');
  const env: Env = {
    CONFIGS_PATH: path.resolve(__dirname, '../../../../configs'),
    ADMIN_EMAIL: 'admin@testdomain.com',
    DATABASE_URL: db.url(),
    REDIS_URL: redis.url(),
    // This should be used for oauth redirect only
    API_BASE_URL: 'http://testdomain.com/',
    ENABLE_CACHE: false,
    QUEUE_LIMIT: 10,
    CONNECTION_LIMIT: 10,
    GITHUB_OAUTH_CLIENT_ID: 'fake',
    GITHUB_OAUTH_CLIENT_SECRET: 'fake',
    GITHUB_ACCESS_TOKENS: process.env.GITHUB_TOKEN ?? '',
    PLAYGROUND_DATABASE_URL: playgroundDatabaseURL,
    PLAYGROUND_DAILY_QUESTIONS_LIMIT: 30,
    PLAYGROUND_TRUSTED_GITHUB_LOGINS: 'testuser',
    EXPLORER_USER_MAX_QUESTIONS_PER_HOUR: 3,
    EXPLORER_USER_MAX_QUESTIONS_ON_GOING: 1,
    EXPLORER_GENERATE_SQL_CACHE_TTL: 60 * 60 * 24 * 7,
    EXPLORER_QUERY_SQL_CACHE_TTL: 60 * 60 * 24,
    JWT_SECRET: 'fake',
    JWT_COOKIE_NAME: 'ossinsight_test_t',
    JWT_COOKIE_DOMAIN: 'http://testdomain.com/',
    JWT_COOKIE_SECURE: 'false',
    JWT_COOKIE_SAME_SITE: 'false',
    OPENAI_API_KEY: 'fake',
    AUTH0_DOMAIN: 'auth0',
    AUTH0_SECRET: 'auth0',
  };

  Object.assign(process.env, env);

  const app = Fastify({
    logger: {
      level: 'error',
    },
  });
  register.clear();
  app.register(fp(App));
  await app.ready();

  await app.listen({
    host: '127.0.0.1',
    port: 0,
  });

  return app;
}

export async function bootstrapApp () {
  if (appPromise) {
    return appPromise;
  }
  appPromise = createApp().then(fastify => new StartedApp(fastify));
  return _app = await appPromise;;
}

export async function releaseApp () {
  if (appPromise) {
    const app = await appPromise;
    await app.close();
    appPromise = undefined;
    _app = undefined;
  }
}

export class StartedApp {

  constructor (public readonly app: FastifyInstance) {
  }

  get url () {
    const address = this.app.server.address() as AddressInfo;
    // noinspection HttpUrlsUsage
    return `http://${address.address}:${address.port}`;
  }

  async ioEmit (event: string, payload: any, bindingEvent = `/q/${payload.query}`): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = this.url;
      const socket = io(url, { transports: ['websocket'], autoConnect: false, reconnection: false });
      socket.once(bindingEvent, (payload) => {
        resolve(payload);
        socket.close();
      });
      setTimeout(() => {
        reject(new Error('io emit timeout'));
        socket.close();
      }, 500);
      socket.connect();
      socket.emit(event, payload);
    });
  }

  expectGet (url: string, config: Omit<MockRequest, 'method'> = {}) {
    return expect(buildMockRequest(this.app, url, { ...config, method: 'get' })).resolves;
  }

  expectPost (url: string, body?: any, config: Omit<MockRequest, 'method'> = {}) {
    return expect(buildMockRequest(this.app, url, { ...config, method: 'post', body })).resolves;
  }

  async close () {
    return this.app.close();
  }
}

export function getTestApp (): StartedApp {
  if (!_app) {
    throw new Error('call bootstrapApp first');
  }
  return _app;
}

export type MockRequest = {
  method: 'get' | 'post'
  headers?: OutgoingHttpHeaders
  cookies?: object
  body?: any
  query?: string | { [k: string]: string | string[] }
  resolveBody?: boolean
}

function buildMockRequest (app: FastifyInstance, url: string, { method, headers, cookies, query, body, resolveBody = true }: MockRequest) {
  let chain = app.inject()[method](url);
  if (headers) {
    chain = chain.headers(headers);
  }
  if (cookies) {
    chain = chain.cookies(cookies);
  }
  if (query) {
    chain = chain.query(query);
  }
  if (body) {
    chain = chain.body(body);
  }
  if (resolveBody) {
    return chain.end().then(transformBody);
  } else {
    return chain.end();
  }
}

function transformBody (response: LightMyRequestResponse): Exclude<LightMyRequestResponse, 'body'> & { body: object } {
  return {
    ...response,
    body: response.json(),
  };
}
