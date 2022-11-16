import { FastifyRouteAsync } from '../types/common';

const options = {
  schema: {
      body: {
          type: 'object',
          properties: {
              repoId: { 
                  type: 'array'
              },
          }
      }
  } as const
};

const root: FastifyRouteAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', options, async function (request, reply) {
    // request.body.repoId
    const collections = await fastify.collectionService.getCollections();
    reply.send(collections);
  })
}

export default root;