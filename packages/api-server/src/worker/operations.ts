import Fastify from 'fastify';
import {register} from 'prom-client';
import {authenticateOperatorToken} from '../utils/http/operator-auth';

export function workerOperations(ready: () => boolean, token?: string) {
  const app = Fastify({logger: false, requestTimeout: 5000, bodyLimit: 1024});
  app.get('/healthy', async (_request, reply) => {
    const healthy = ready();
    return reply.code(healthy ? 200 : 503).send({healthy});
  });
  app.get('/metrics', async (request, reply) => {
    try { authenticateOperatorToken(request.headers.authorization, token); }
    catch (error: any) { return reply.code(error.statusCode || 503).send({error: 'Operator authentication required.'}); }
    return reply.type(register.contentType).send(await register.metrics());
  });
  return app;
}
