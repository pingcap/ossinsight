import { bootstrapApp, getTestApp, releaseApp } from './helpers/app';
import { bootstrapTestContainer, releaseTestContainer } from './helpers/db';
import io from 'socket.io-client';

beforeAll(bootstrapTestContainer);
beforeEach(bootstrapApp);
afterEach(releaseApp);
afterAll(releaseTestContainer);

const allowedOrigins = ['https://ossinsight.io', 'https://pingcap-ossinsight-preview-pr-9999.surge.sh', 'https://github1s.com', 'https://github.com'];

describe('http', () => {
  it('should start', async () => {
    const { data } = await getTestApp().get(`/q/events-total`);
    expect(data.data.length === 1);
  });

  describe('cors rules', () => {
    it('should accept', async () => {
      for (const origin of allowedOrigins) {
        await getTestApp().get(`/q/events-total`, { headers: { Origin: origin } })
          .then(({ headers }) => {
            expect(headers['access-control-allow-origin']).toBe(origin);
          });
      }
    });

    it('should reject', async () => {
      await getTestApp().get(`/q/events-total`, { headers: { 'Origin': 'https://example.com' } })
        .then(({ headers }) => {
          expect(headers['access-control-allow-origin']).toBeUndefined();
        });
    });
  });

  describe('api', () => {
    const APIs = [
      '/q/explain/{query}',
      '/q/{query}',
      '/qo/repos/groups/osdb',
      '/gh/repo/{owner}/{repo}',
      // TODO: GraphQL needs tokens
      // // '/gh/repos/search?keyword=fake',
      // // '/gh/users/search?keyword=fake',
      '/collections',
      '/collections/{collectionId}',
    ];

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
        await getTestApp().expectGet(realUrl).toMatchObject({ status: 200, data: {} });
      });
    });
  });
});

describe('socket.io', () => {
  it('should start', async () => {
    let data = await getTestApp().ioEmit('q', { query: 'events-total' }, '/q/events-total');
    expect(data.payload.data.length).toBe(1);

    // data = await getTestApp().pollingEmit('q', { query: 'events-total' }, '/q/events-total');
    // expect(data.payload.data.length).toBe(1);
  });

  for (const transport of ['websocket' /*'polling'*/]) {
    describe(transport, () => {
      it('should follow cors rules', async () => {
        await new Promise<void>((resolve, reject) => {
          io(getTestApp().url, {
            transports: [transport],
            extraHeaders: {
              Origin: 'https://example.com',
            },
          })
            .on('connect', () => {
              reject(new Error('should be rejected by CORS'));
            })
            .on('connect_error', (err) => {
              expect(err.message).toMatch(/(websocket|xhr poll) error/);
              resolve();
            });
        });

        for (const origin of allowedOrigins) {
          await new Promise<void>((resolve, reject) => {
            io(getTestApp().url, {
              transports: [transport],
              extraHeaders: {
                Origin: origin,
              },
            })
              .on('connect', resolve)
              .on('connect_error', reject);
          });
        }
      });
    });
  }
});

