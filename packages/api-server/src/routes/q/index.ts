import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts/index";

const schema = {
  querystring: {
    type: 'object',
    properties: {},
    additionalProperties: true
  }
} as const;

const queryHandler: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
  app.get('/*', { schema }, async function (req, reply) {
    const url = new URL(req.url, 'http://localhost');
    const queryName = url.pathname?.replace('/q/', '');
    if (!queryName) {
      reply.code(400).send({
        error: 'Bad Request',
        message: 'Invalid query name.',
        statusCode: 400
      });
      return;
    }
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
