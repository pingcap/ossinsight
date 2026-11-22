import Fastify from 'fastify';
import {register} from 'prom-client';
import {createOperatorAuthenticator, OperatorCredentials} from '../utils/http/operator-auth';

export function workerOperations(ready: () => boolean, credentials?: OperatorCredentials) {
  const authenticate = createOperatorAuthenticator(credentials);
  const app = Fastify({logger: false, requestTimeout: 5000, bodyLimit: 1024});
  app.get('/healthy', async (_request, reply) => {
    const healthy = ready();
    return reply.code(healthy ? 200 : 503).send({healthy});
  });
  app.get('/metrics', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    try { authenticate(request.headers.authorization); }
    catch (error: any) { return reply.code(error.statusCode || 503).send({error: 'Operator authentication required.'}); }
    return reply.type(register.contentType).send(await register.metrics());
  });
  return app;
}
