import { FastifyPluginAsync } from 'fastify'

interface IParams {
    id: number
}

const schema = {
    params: {
        type: 'object', required: ['id'],
        properties: {
            id: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER }
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
