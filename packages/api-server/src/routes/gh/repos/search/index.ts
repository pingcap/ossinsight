import { FastifyPluginAsync } from 'fastify';

interface IQueryString {
  keyword: string;
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: IQueryString;
  }>('/', async function (req, reply) {
    const res = await fastify.ghExecutor.searchRepos(req.query.keyword);
    reply.send(res);
  })
}

export default root;
