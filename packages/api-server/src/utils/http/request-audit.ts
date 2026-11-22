import {FastifyInstance} from 'fastify';
import {requestAuditContext} from '@ossinsight/types';

declare module 'fastify' {
  interface FastifyRequest { securityActor?: string | null }
}

export function registerRequestAudit(app: FastifyInstance) {
  app.decorateRequest('securityActor', null);
  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('X-Request-ID', request.id);
    if (request.headers.authorization || /^\/(?:q|queries|collections|v1|explorer|user|gh)(?:\/|$)/.test(request.routeOptions.url || '')) {
      reply.header('Cache-Control', 'no-store');
      reply.header('CDN-Cache-Control', 'no-store');
      reply.removeHeader('Expires');
    }
    return payload;
  });
  app.addHook('onResponse', async (request, reply) => {
    app.log.info({event: 'api_request', requestId: request.id, actor: request.securityActor || 'anonymous',
      method: request.method, route: request.routeOptions.url || 'unmatched',
      ...requestAuditContext(request.routeOptions.url || 'unmatched', request.raw.url),
      sourceIP: request.ip, statusCode: reply.statusCode, durationMs: reply.elapsedTime});
  });
}
