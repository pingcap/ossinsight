import {AxiosHeaders} from 'axios';
import Fastify from 'fastify';
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
