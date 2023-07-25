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

    // Retrieve query result from TiDB data service.
    const url = req.url.replace(/^\/public/, '');
    const res = await app.tidbDataService.request(url);
    const json = await res.json();
    reply
      .code(res.status)
      .headers(res.headers)
      .send(json);
  })
}

export default queryHandler;
