import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const collections = await fastify.collectionService.getCollections();
    reply.send(collections);
  })
}

export default root;
