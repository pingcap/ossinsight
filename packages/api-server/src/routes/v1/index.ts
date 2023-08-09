import {FastifyPluginAsync} from "fastify";
import {APIError} from "../../utils/error";

const schema = {
  operationId: 'other-api',
  summary: 'Other Query API',
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
      throw new APIError(500, 'TiDB data service is not initialized.');
    }

    // Retrieve query result from TiDB data service.
    const url = req.url.replace(/^\/public/, '');
    const res = await app.tidbDataService.request(url);

    reply
      .code(res.status)
      .headers(res.headers)
      .send(res.data);
  })
}

export default queryHandler;
