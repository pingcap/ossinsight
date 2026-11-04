import {FastifyInstance} from 'fastify';
import {requestAuditContext} from '@ossinsight/types';
import {authenticateOperatorToken} from './operator-auth';

declare module 'fastify' {
  interface FastifyRequest { securityActor?: string | null }
}

export function registerRequestAudit(app: FastifyInstance, operationsToken?: string) {
  app.decorateRequest('securityActor', null);
  app.addHook('onRequest', async request => {
    if (request.routeOptions.url === '/metrics' || request.routeOptions.url === '/docs/json') {
      request.securityActor = authenticateOperatorToken(request.headers.authorization, operationsToken);
    }
  });
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
