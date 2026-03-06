import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

export const GENERATE_SQL_USED_HEADER = "x-playground-generate-sql-used";
export const GENERATE_SQL_LIMIT_HEADER = "x-playground-generate-sql-limit";
export const MAX_DAILY_GENERATE_SQL_LIMIT = 2000;

const root: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.get('/', {
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { playgroundService } = app;
    const userId = await app.userService.getUserIdOrCreate(req);

    // Get the limit and used.
    const used = await playgroundService.countTodayQuestionRequests(userId, false);
    let limit = app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT || MAX_DAILY_GENERATE_SQL_LIMIT;
    if (await app.playgroundService.checkIfTrustedUser(userId)) {
      // Give the trusted users more daily requests.
      limit = MAX_DAILY_GENERATE_SQL_LIMIT;
    }

    // Set the headers.
    reply.status(200).send({
      limit,
      used,
    });
  });
}

export default root;