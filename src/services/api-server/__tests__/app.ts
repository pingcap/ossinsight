import { bootstrapApp, getTestApp, releaseApp } from './helpers/app';
import { bootstrapTestDatabase, releaseTestDatabase } from './helpers/db';
import io from 'socket.io-client';
import {bootstrapTestRedis, releaseTestRedis} from "./helpers/redis";

beforeAll(bootstrapTestDatabase);
beforeAll(bootstrapTestRedis);
beforeAll(bootstrapApp);
afterAll(releaseApp);
afterAll(releaseTestRedis);
afterAll(releaseTestDatabase);

const allowedOrigins = ['https://ossinsight.io', 'https://pingcap-ossinsight-preview-pr-9999.surge.sh', 'https://github1s.com', 'https://github.com'];

describe('http', () => {
  test('should start', async () => {
    await getTestApp().expectGet(`/q/events-total`).toMatchObject({
      statusCode: 200,
      body: {
        data: [
          expect.anything(),
        ],
      },
    });
  });

  describe('cors rules', () => {
    test('should accept', async () => {
      for (const origin of allowedOrigins) {
        await getTestApp().expectGet(`/q/events-total`, { headers: { Origin: origin } })
          .toMatchObject({
            headers: {
              'access-control-allow-origin': origin,
              'access-control-expose-headers': expect.stringMatching('x-playground-generate-sql-used, x-playground-generate-sql-limit'),
            },
          });
      }
    });

    test('should reject', async () => {
      await getTestApp().expectGet(`/q/events-total`, { headers: { 'Origin': 'https://example.com' } })
        .toMatchObject({
          headers: expect.not.objectContaining({
            'access-control-allow-origin': expect.anything(),
          }),
        });
    });
  });

  describe('api', () => {
    const APIs = [
      '/q/explain/{query}',
      '/q/{query}',
      '/qo/repos/groups/osdb',
      '/gh/repo/{owner}/{repo}',
      '/collections',
      '/collections/{collectionId}'
    ];

    const APIs_NEEDS_TOKENS = [
      '/gh/repos/search?keyword=keyword',
      '/gh/users/search?keyword=keyword',
    ];

    if (process.env.GITHUB_TOKEN) {
      APIs.push(...APIs_NEEDS_TOKENS);
    } else {
      APIs_NEEDS_TOKENS.forEach(url => {
        it.todo(`should success GET ${url} (process.env.GITHUB_TOKEN not provided)`);
      });
    }

    // Variable replacements in above URLs
    const variables = {
      query: 'events-total',
      owner: 'pingcap',
      repo: 'ossinsight',
      collectionId: '1',
    };

    APIs.forEach(url => {
      it(`should success GET ${url}`, async () => {
        const realUrl = Object.entries(variables).reduce((url, [k, v]) => {
          return url.replaceAll(`{${k}}`, v);
        }, url);
        await getTestApp().expectGet(realUrl).toMatchObject({ statusCode: 200, body: {} });
      });
    });

    it(`should execute playground SQL`, async () => {
      await getTestApp().expectPost('/q/playground', {
        id: '449649595',
        sql: 'SELECT\n  *\nFROM\n  github_events\nWHERE\n  repo_id = 449649595\n  AND type = \'PullRequestEvent\'\nORDER BY\n  created_at ASC\nLIMIT\n  1\n;',
        type: 'repo',
      }).toMatchObject({ statusCode: 200, body: {} });
    });
  });

  describe('swagger json', () => {
    test('should success', async () => {
      await getTestApp().expectGet('/docs/json').toMatchObject({ statusCode: 200, body: {} });
    });
  });

  describe('metrics', () => {
    const APIs = [
      '/metrics'
    ];

    APIs.forEach(url => {
      it(`should success GET ${url}`, async () => {
        await getTestApp().expectGet(url, {
          resolveBody: false,
        }).toMatchObject({ statusCode: 200 });
      });
    });
  });
});

describe('socket.io', () => {
  test('should start', async () => {
    let data = await getTestApp().ioEmit('q', { query: 'events-total' }, '/q/events-total');
    expect(data.payload.data.length).toBe(1);
  });

  test('should be compact format', async () => {
    await expect(getTestApp().ioEmit('q', {
      query: 'events-total',
      format: 'compact',
      excludeMeta: true
    }, '/q/events-total'))
        .resolves
        .toMatchObject({
          payload: {
            data: [
              expect.any(Array)
            ],
            fields: expect.any(Array),
          },
          compact: true,
        });
  });

  for (const transport of ['websocket']) {
    describe(transport, () => {
      test('should follow cors rules', async () => {
        await new Promise<void>((resolve, reject) => {
          const socket = io(getTestApp().url, {
            transports: [transport],
            extraHeaders: {
              Origin: 'https://example.com',
            },
          })
          socket.on('connect', () => {
            reject(new Error('should be rejected by CORS'));
            socket.close();
          })
          socket.on('connect_error', (err) => {
            expect(err.message).toMatch(/(websocket|xhr poll) error/);
            resolve();
            socket.close();
          });
        });

        for (const origin of allowedOrigins) {
          await new Promise<void>((resolve, reject) => {
            const socket = io(getTestApp().url, {
              transports: [transport],
              extraHeaders: {
                Origin: origin,
              },
            })
            socket.on('connect', () => {
              resolve();
              socket.close();
            })
            socket.on('connect_error', err => {
              reject(err);
              socket.close();
            });
          });
        }
      });
    });
  }
});

