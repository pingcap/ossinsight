import { FastifyPluginAsync } from 'fastify';

interface IParams {
    owner: string;
    repo: string;
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Params: IParams;
  }>('/', async function (req, reply) {
    const res = await fastify.ghExecutor.getRepo(req.params.owner, req.params.repo);
    reply.send(res);
  })
}

export default root;
