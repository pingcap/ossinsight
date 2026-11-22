import Fastify from 'fastify';
import {registerRequestAudit} from '../../src/utils/http/request-audit';

for (const route of ['/user', '/user/email-updates', '/explorer/questions/:id']) {
  test.each([200, 401, 500])(route + ' never caches private success/error responses (%s)', async status => {
    const app = Fastify();
    registerRequestAudit(app);
    app.get(route, async (_request, reply) => reply.code(status)
      .header('Cache-Control', 'public, max-age=3600').header('CDN-Cache-Control', 'public, s-maxage=3600')
      .header('Expires', 'Thu, 01 Jan 2037 00:00:00 GMT').send({emailAddress: 'fixture@example.test'}));
    try {
      const response = await app.inject(route.replace(':id', 'synthetic-question'));
      expect(response.statusCode).toBe(status);
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.headers['cdn-cache-control']).toBe('no-store');
      expect(response.headers).not.toHaveProperty('expires');
    } finally {await app.close();}
  });
}
