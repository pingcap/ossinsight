import {FastifyInstance} from 'fastify';
import {createOperatorAuthenticator, OperatorCredentials} from './operator-auth';

declare module 'fastify' {
  interface FastifyContextConfig { operatorOnly?: boolean }
}

/** Every route registered here, including nested plugins, requires an operator. */
export async function registerOperatorRoutes(app: FastifyInstance, credentials: OperatorCredentials,
  register: (scope: FastifyInstance) => Promise<void>): Promise<void> {
  const authenticate = createOperatorAuthenticator(credentials);
  await app.register(async scope => {
    scope.addHook('onRoute', options => {
      options.config = {...options.config, operatorOnly: true};
    });
    scope.addHook('onRequest', async request => {
      request.securityActor = authenticate(request.headers.authorization);
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
