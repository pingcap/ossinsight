import {createOperatorTokenVerifier, OperatorTokenConfig} from '@ossinsight/types/dist/operator-token';
import {FastifyInstance} from 'fastify';
import {APIError} from '../errors';

declare module 'fastify' {
  interface FastifyRequest { operatorActor?: string }
}

function createAuthenticator(credentials: string | OperatorTokenConfig | undefined) {
  const verify = createOperatorTokenVerifier(typeof credentials === 'object' ? credentials : {current: credentials});
  return (authorization: unknown): string => {
    const result = verify(authorization);
    if (result.status === 'unconfigured') throw new APIError(503, 'Operator access is not configured.');
    if (result.status !== 'accepted') throw new APIError(401, 'Operator authentication required.');
    return `pipeline-operator:${result.fingerprint}`;
  };
}

export function authenticateOperator(authorization: unknown, secret: string | undefined): string {
  return createAuthenticator(secret)(authorization);
}

export function registerOperatorAuth(app: FastifyInstance, credentials?: string | OperatorTokenConfig) {
  const authenticate = createAuthenticator(credentials);
  app.addHook('onRequest', async request => {
    // The existing root endpoint contains only a boolean health response.
    if (['GET', 'HEAD'].includes(request.method) && request.routeOptions.url === '/') return;
    request.operatorActor = authenticate(request.headers.authorization);
  });
  app.addHook('onSend', async (_request, reply, payload) => {
    reply.header('Cache-Control', 'no-store');
    return payload;
  });
  app.addHook('onResponse', async (request, reply) => {
    app.log.info({event: 'pipeline_request', actor: request.operatorActor || 'anonymous',
      requestId: request.id, method: request.method, route: request.routeOptions.url,
      sourceIP: request.ip, statusCode: reply.statusCode});
  });
}
