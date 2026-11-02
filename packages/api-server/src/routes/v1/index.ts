import { FastifyPluginAsync } from 'fastify';

// Only explicitly registered public routes may use Data Service credentials.
const queryHandler: FastifyPluginAsync = async app => {
  app.get('/*', async (_request, reply) => {
    reply.code(404).send({ message: 'API endpoint not found.' });
  });
};
export default queryHandler;
