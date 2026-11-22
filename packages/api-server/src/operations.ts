import {FastifyInstance} from 'fastify';
import {registerOperatorRoutes} from './utils/http/operator-routes';
import {operationsCredentials} from './utils/http/operator-auth';

export async function registerOperationalEndpoints(app: FastifyInstance): Promise<void> {
  await registerOperatorRoutes(app, operationsCredentials(app.config), async operations => {
    // Instrumentation remains registered on the parent so public routes are
    // measured too. Only reading the configured registry is operator-only.
    operations.get('/metrics', {logLevel: 'fatal', exposeHeadRoute: false}, async (_request, reply) => {
      const registry = operations.metrics.client.register;
      return reply.type(registry.contentType).send(await registry.metrics());
    });
    // Register after product routes so the schema includes their definitions.
    operations.get('/docs/json', async () => operations.swagger());
    // Add future operational endpoints in this scope to inherit authentication.
  });
}
