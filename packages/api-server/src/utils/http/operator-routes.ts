import {APIError} from '../error';
import {FastifyInstance} from 'fastify';
import {createOperatorAuthenticator, OperatorCredentials} from './operator-auth';

declare module 'fastify' {
  interface FastifyContextConfig { operatorOnly?: boolean; operatorAuthenticate?: (authorization: unknown) => string }
}

/** Every route registered here, including nested plugins, requires an operator. */
export async function registerOperatorRoutes(app: FastifyInstance, credentials: OperatorCredentials,
  register: (scope: FastifyInstance) => Promise<void>, capability: 'metrics:read' | 'schema:read' = 'metrics:read'): Promise<void> {
  const authenticate = createOperatorAuthenticator(credentials, capability);
  await app.register(async scope => {
    scope.addHook('onRoute', options => {
      options.config = {...options.config, operatorOnly: true, operatorAuthenticate: authenticate};
    });
    scope.addHook('onRequest', async request => {
      request.securityActor = authenticate(request.headers.authorization);
      if (!['GET', 'HEAD'].includes(request.method)) throw new APIError(403, 'This capability grants read access only.');
    });
    scope.addHook('onSend', async (_request, reply, payload) => {
      reply.header('Cache-Control', 'no-store');
      reply.header('CDN-Cache-Control', 'no-store');
      reply.removeHeader('Expires');
      return payload;
    });
    await register(scope);
  });
}
