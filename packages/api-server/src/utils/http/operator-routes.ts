import {FastifyInstance} from 'fastify';
import {authenticateOperatorToken} from './operator-auth';

declare module 'fastify' {
  interface FastifyContextConfig { operatorOnly?: boolean }
}

/** Every route registered here, including nested plugins, requires an operator. */
export async function registerOperatorRoutes(app: FastifyInstance, token: string | undefined,
  register: (scope: FastifyInstance) => Promise<void>): Promise<void> {
  await app.register(async scope => {
    scope.addHook('onRoute', options => {
      options.config = {...options.config, operatorOnly: true};
    });
    scope.addHook('onRequest', async request => {
      request.securityActor = authenticateOperatorToken(request.headers.authorization, token);
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
