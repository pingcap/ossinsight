import {FastifyPluginAsync} from "fastify";
import {DateTime} from 'luxon';

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
    const res = await app.queryRunner.query<any>(queryName, req.query);

    const { sql, requestedAt, refresh } = res;
    app.statsService.addQueryStatsRecord(queryName, sql, requestedAt, refresh).catch((err) => {
      app.log.info(err, `Failed to add query stats record for ${queryName}.`);
    });

    // Add expires header if result was cached.
    if (res.expiresAt) {
      const expireAtDate = DateTime.fromISO(res.expiresAt);
      // Notice: Only cache on client if the result will expire in 7 days.
      if (expireAtDate.isValid && expireAtDate.diff(DateTime.utc(), 'day').days < 7) {
        reply.header('Expires', expireAtDate.toHTTP());
      }
    }

    reply.send(res);
  })
}

export default queryHandler;
