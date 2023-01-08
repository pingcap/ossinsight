import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

export const GENERATE_SQL_USED_HEADER = "x-playground-generate-sql-used";
export const GENERATE_SQL_LIMIT_HEADER = "x-playground-generate-sql-limit";
export const MAX_DAILY_GENERATE_SQL_LIMIT = 2000;

const root: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.get('/quota', {
    // @ts-ignore
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { playgroundService } = app;
    const { sub } = req.user as {
      sub: string;
    };
    const userId = await app.userService.findOrCreateUserByAuth0Sub(sub, req.headers.authorization);

    const conn = await this.mysql.getConnection();
    try {
      // Get the limit and used.
      let limit = app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT || MAX_DAILY_GENERATE_SQL_LIMIT;
      let used = await playgroundService.countTodayQuestionRequests(conn, userId, false);

      // Give the trusted users more daily requests.
      const trustedLogins = app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS;
      if (trustedLogins.includes(sub)) {
        limit = MAX_DAILY_GENERATE_SQL_LIMIT;
      }

      // Set the headers.
      reply.status(200).send({
        limit,
        used,
      });
    } finally {
      conn.release();
    }
  });
}

export default root;