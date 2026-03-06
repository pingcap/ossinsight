import { FastifyPluginAsync } from 'fastify'

interface IParams {
  queryName: string;
}

type IQuerystring = Record<string, any>;

const queryHandler: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Params: IParams;
    QueryString: IQuerystring;
  }>('/', async function (req, reply) {
    const { queryName } = req.params;
    const query = req.query as IQuerystring;
    const res = await fastify.queryRunner.explain(queryName, query);
    reply.send(res);
  })
}

export default queryHandler;
