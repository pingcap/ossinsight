import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";

const schema = {
  params: {
    type: 'object',
    required: ['queryName'],
    properties: {
      queryName: {
        type: 'string',
        description: 'The name of query you want to get'
      }
    }
  },
  querystring: {
    type: 'object',
    properties: {},
    additionalProperties: true
  }
} as const;

const queryHandler: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
  app.get('/', { schema }, async function (req, reply) {
    const { queryName } = req.params;
    const query = req.query;
    const res = await app.queryRunner.query<any>(queryName, query);

    const { sql, requestedAt, refresh } = res;
    app.statsService.addQueryStatsRecord(queryName, sql, requestedAt, refresh).catch((err) => {
      app.log.info(err, `Failed to add query stats record for ${queryName}.`);
    });

    reply.send(res);
  })
}

export default queryHandler;
