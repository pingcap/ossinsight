import { FastifyPluginAsync } from 'fastify';

interface IQueryString {
  format: string;
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: IQueryString;
  }>('/', async function (req, reply) {
    const res = await fastify.collectionService.getOSDBRepoGroups();
    let type, body;
    if (req.query.format === 'global_variable') {
      type = 'text/javascript'
      body = `var osdbgroup = (${JSON.stringify(res)});`
    } else {
      type = 'application/json'
      body = res
    }
    reply.code(200).type(type).send(body);
  })
}

export default root;
