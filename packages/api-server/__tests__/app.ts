import { bootstrapApp, getTestApp, releaseApp } from './helpers/app';
import { bootstrapTestDatabase, releaseTestDatabase } from './helpers/db';
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
    await getTestApp().expectGet(`/`).toMatchObject({
      statusCode: 200,
      body: {
        root: true,
      },
    });
  });

  describe('cors rules', () => {
    test('should accept', async () => {
      for (const origin of allowedOrigins) {
        await getTestApp().expectGet(`/`, { headers: { Origin: origin } })
          .toMatchObject({
            headers: {
              'access-control-allow-origin': origin,
              'access-control-expose-headers': expect.stringMatching('x-playground-generate-sql-used, x-playground-generate-sql-limit'),
            },
          });
      }
    });

    test('should reject', async () => {
      await getTestApp().expectGet(`/`, { headers: { 'Origin': 'https://example.com' } })
        .toMatchObject({
          headers: expect.not.objectContaining({
            'access-control-allow-origin': expect.anything(),
          }),
        });
    });
  });

  describe('api', () => {
    const APIs = [
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
