import {createHash, timingSafeEqual} from 'crypto';
import {FastifyInstance} from 'fastify';
import {APIError} from '../errors';

declare module 'fastify' {
  interface FastifyRequest { operatorActor?: string }
}

export function authenticateOperator(authorization: unknown, secret: string | undefined): string {
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) throw new APIError(503, 'Operator access is not configured.');
  if (typeof authorization !== 'string' || authorization.length > 512 || !authorization.startsWith('Bearer ')) {
    throw new APIError(401, 'Operator authentication required.');
  }
  const expected = createHash('sha256').update(secret).digest();
  const supplied = createHash('sha256').update(authorization.slice(7)).digest();
  if (!timingSafeEqual(expected, supplied)) throw new APIError(401, 'Operator authentication required.');
  return `pipeline-operator:${expected.toString('hex').slice(0, 12)}`;
}

export function registerOperatorAuth(app: FastifyInstance, secret?: string) {
  app.addHook('onRequest', async request => {
    // The existing root endpoint contains only a boolean health response.
    if (['GET', 'HEAD'].includes(request.method) && request.routeOptions.url === '/') return;
    request.operatorActor = authenticateOperator(request.headers.authorization, secret);
  });
  app.addHook('onResponse', async (request, reply) => {
    app.log.info({event: 'pipeline_request', actor: request.operatorActor || 'anonymous',
      requestId: request.id, method: request.method, route: request.routeOptions.url,
      sourceIP: request.ip, statusCode: reply.statusCode});
  });
}
