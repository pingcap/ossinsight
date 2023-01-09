import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import { Auth0User, parseAuth0User } from "../../../../plugins/services/user-service/auth0";

export const GENERATE_SQL_USED_HEADER = "x-playground-generate-sql-used";
export const GENERATE_SQL_LIMIT_HEADER = "x-playground-generate-sql-limit";
export const MAX_DAILY_GENERATE_SQL_LIMIT = 2000;

const root: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.get('/', {
    // @ts-ignore
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { playgroundService } = app;

    const conn = await this.mysql.getConnection();

    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization,
      conn
    );
    
    try {
      // Get the limit and used.
      let limit = app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT || MAX_DAILY_GENERATE_SQL_LIMIT;
      let used = await playgroundService.countTodayQuestionRequests(conn, userId, false);

      // Give the trusted users more daily requests.
      const trustedLogins = app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS;
      if (trustedLogins.includes(metadata?.github_login || '')) {
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