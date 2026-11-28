import fp from 'fastify-plugin';

export default fp(async app => {
  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    // Production deployments may terminate TLS before the Fastify listener.
    if (process.env.NODE_ENV === 'production' || request.protocol === 'https') {
      reply.header('Strict-Transport-Security', 'max-age=31536000');
    }
    return payload;
  });
}, { name: '@ossinsight/browser-headers' });
