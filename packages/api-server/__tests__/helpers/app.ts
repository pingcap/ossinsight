import { bootstrapTestContainer } from './db';
import type { APIServerEnvSchema } from '../../src/env';
import Fastify, { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import App from '../../src/app';
import { AddressInfo } from 'net';
import * as path from 'path';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import Axios from 'axios';
import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';

type Schema = (typeof APIServerEnvSchema)['properties']
type Env = {
  [P in keyof Schema]: Schema[P] extends { default: any } ? any | undefined : any
}

let _app: StartedApp | undefined;
let appPromise: Promise<FastifyInstance> | undefined;

async function createApp () {
  if (appPromise) {
    return appPromise;
  }
  const db = await bootstrapTestContainer();

  // Override process env
  const env: Env = {
    CONFIGS_PATH: path.resolve(__dirname, '../../../../configs'),
    DATABASE_URL: db.url(),
    // This should be used for oauth redirect only
    API_BASE_URL: 'http://testdomain.com/',
    ENABLE_CACHE: false,
    GITHUB_OAUTH_CLIENT_ID: 'fake',
    GITHUB_OAUTH_CLIENT_SECRET: 'fake',
    GITHUB_ACCESS_TOKENS: 'fake',
    JWT_SECRET: 'fake',
    JWT_COOKIE_NAME: 'ossinsight_test_t',
    JWT_COOKIE_DOMAIN: 'http://testdomain.com/',
    JWT_COOKIE_SECURE: 'false',
    JWT_COOKIE_SAME_SITE: 'false',
    OPENAI_API_KEY: 'fake',
  };

  Object.assign(process.env, env);

  const app = Fastify({
    logger: {
      level: 'error',
    },
  });
  app.register(fp(App));
  await app.ready();

  await app.listen({
    host: '127.0.0.1',
    port: 0,
  });

  return app;
}

export async function bootstrapApp () {
  const app = await createApp();
  return _app = new StartedApp(app);
}

export async function releaseApp () {
  if (appPromise) {
    const app = await appPromise;
    await app.close();
    appPromise = undefined;
    _app = undefined;
  }
}

class StartedApp {
  readonly axios: AxiosInstance;
  readonly socket: Socket;
  readonly polling: Socket;

  constructor (public readonly app: FastifyInstance) {
    const url = this.url;
    this.axios = Axios.create({
      baseURL: url,
    });
    this.socket = io(url, { transports: ['websocket'], autoConnect: false, reconnection: false });
    this.polling = io(url, { transports: ['polling'], autoConnect: false, reconnection: false });
  }

  get url () {
    const address = this.app.server.address() as AddressInfo;
    // noinspection HttpUrlsUsage
    return `http://${address.address}:${address.port}`;
  }

  async ioEmit (event: string, payload: any, bindingEvent = `/q/${payload.query}`): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.once(bindingEvent, (payload) => {
        resolve(payload);
      });
      setTimeout(() => {
        reject(new Error('io emit timeout'));
      }, 500);
      if (!this.socket.connected) {
        this.socket.connect();
      }
      this.socket.emit(event, payload);
    });
  }

  // async pollingEmit (event: string, payload: any, bindingEvent = `/q/${payload.query}`): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.polling.once(bindingEvent, (payload) => {
  //       resolve(payload);
  //     });
  //     setTimeout(() => {
  //       reject(new Error('io emit timeout'));
  //     }, 500);
  //     if (!this.polling.connected) {
  //       this.polling.connect();
  //     }
  //     this.polling.emit(event, payload);
  //   });
  // }

  get (url: string, config?: AxiosRequestConfig) {
    return this.axios.get(url, config)
  }

  post (url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axios.post(url, data, config)
  }

  expectGet (url: string, config?: AxiosRequestConfig) {
    return expect(this.get(url, config)).resolves
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
