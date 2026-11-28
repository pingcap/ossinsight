import {AxiosHeaders} from 'axios';
import Fastify from 'fastify';
import browserHeaders from '../../src/plugins/browser-headers';
import osdb from '../../src/routes/qo/repos/groups/osdb';
import {errorHandler} from '../../src/utils/http/error-handler';
import {responseHeaders} from '../../src/utils/response-headers';

test.each(['set-cookie', 'Set-Cookie', 'SeT-CoOkIe', 'set-cookie2'])('upstream %s cannot set browser state; safe metadata remains available', async cookieName => {
  const app = Fastify();
  const headers = new AxiosHeaders({
    [cookieName]: ['a=1; HttpOnly', 'b=2; Secure'],
    'x-count': 12,
    'x-disabled': false,
    'x-unset': null,
  });
  app.get('/', async (_request, reply) => reply.headers(responseHeaders(headers)).send('ok'));
  try {
    const res = await app.inject('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers).not.toHaveProperty('set-cookie');
    expect(res.headers).not.toHaveProperty('set-cookie2');
    expect(res.headers['x-count']).toBe('12');
    expect(res.headers).not.toHaveProperty('x-disabled');
    expect(res.headers).not.toHaveProperty('x-unset');
  } finally {
    await app.close();
  }
});

test('browser headers apply to JSON, errors and not-found responses', async () => {
  const app = Fastify({trustProxy: ['127.0.0.1']});
  const groups = [{group_name: 'example', repos: []}];
  const getOSDBRepoGroups = jest.fn(async () => groups);
  app.decorate('collectionService', {getOSDBRepoGroups} as any);
  app.setErrorHandler(errorHandler);
  await app.register(browserHeaders);
  await app.register(osdb, {prefix: '/groups'});
  try {
    for (const [url, status] of [['/groups', 200], ['/groups?format=global_variable', 406], ['/missing', 404]] as const) {
      const res = await app.inject({url, remoteAddress: '127.0.0.1', headers: {'x-forwarded-proto': 'https'}});
      expect(res.statusCode).toBe(status);
      expect(res.headers['content-type']).toMatch(/^application\/json/);
      expect(res.headers['content-security-policy']).toContain("frame-ancestors 'none'");
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['strict-transport-security']).toBe('max-age=31536000');
      if (status === 200) expect(res.json()).toEqual(groups);
    }
    expect(getOSDBRepoGroups).toHaveBeenCalledTimes(1);
    const local = await app.inject('/groups');
    expect(local.headers['strict-transport-security']).toBeUndefined();
  } finally { await app.close(); }
});
