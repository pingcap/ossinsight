import { FastifyPluginAsync } from 'fastify'

interface IParams {
    id: number
}

const schema = {
    params: {
        type: 'object',
        properties: {
            collectionId: { type: 'number' }
        }
    }
};

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Params: IParams
  }>('/', { schema }, async function (req, reply) {
    const collections = await fastify.collectionService.getCollectionRepos(req.params.id);
    reply.send(collections);
  })
}

export default root;
