import {FastifyInstance} from 'fastify';
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
  app.addHook('onResponse', async (request, reply) => {
    app.log.info({event: 'api_request', requestId: request.id, actor: request.securityActor || 'anonymous',
      method: request.method, route: request.routeOptions.url || 'unmatched',
      sourceIP: request.ip, statusCode: reply.statusCode, durationMs: reply.elapsedTime});
  });
}
