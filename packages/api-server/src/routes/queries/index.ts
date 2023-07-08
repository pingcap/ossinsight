import {FastifyPluginAsync} from "fastify";

const schema = {
  querystring: {
    type: 'object',
    properties: {},
    additionalProperties: true
  } as const
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get<{
    Querystring: Record<string, any>
  }>('/*', { schema }, async function (req, reply) {
    if (!app.tidbDataService) {
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'TiDB data service is not initialized.',
        statusCode: 500
      });
      return;
    }

    // Extract query name from URL.
    const url = new URL(req.url, 'http://localhost');
    const queryName = url.pathname?.replace('/queries/', '');
    if (!queryName) {
      reply.code(400).send({
        error: 'Bad Request',
        message: 'Invalid query name.',
        statusCode: 400
      });
      return;
    }

    // Retrieve query result from TiDB data service.
    const res = await app.tidbDataService.query(queryName, req.query);
    const json = await res.json();
    reply
      .code(res.status)
      .headers(res.headers)
      .send(json);
  })
}

export default queryHandler;
