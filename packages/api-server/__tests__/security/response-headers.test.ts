import {AxiosHeaders} from 'axios';
import Fastify from 'fastify';
import {responseHeaders} from '../../src/utils/response-headers';

test('upstream headers retain cookies and omit disabled or unset values', async () => {
  const app = Fastify();
  const headers = new AxiosHeaders({
    'set-cookie': ['a=1; HttpOnly', 'b=2; Secure'],
    'x-count': 12,
    'x-disabled': false,
    'x-unset': null,
  });
  app.get('/', async (_request, reply) => reply.headers(responseHeaders(headers)).send('ok'));
  try {
    const res = await app.inject('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toEqual(['a=1; HttpOnly', 'b=2; Secure']);
    expect(res.headers['x-count']).toBe('12');
    expect(res.headers).not.toHaveProperty('x-disabled');
    expect(res.headers).not.toHaveProperty('x-unset');
  } finally {
    await app.close();
  }
});
