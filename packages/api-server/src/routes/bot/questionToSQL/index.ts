import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {QuestionContext} from "../../../plugins/services/bot-service";
import {APIError} from "../../../utils/error";

export interface IBody {
  question: string;
  context?: QuestionContext
}

const schema = {
  body: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      context: {
        type: 'object',
        properties: {
          repo_id: {
            type: 'number'
          },
          repo_name: {
            type: 'string',
          }
        }
      }
    }
  }
} as const;

export const GENERATE_SQL_USED_HEADER = "x-playground-generate-sql-used";
export const GENERATE_SQL_LIMIT_HEADER = "x-playground-generate-sql-limit";
export const MAX_DAILY_GENERATE_SQL_LIMIT = 2000;

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
  app.head('/', {
    preHandler: [app.authenticate],
  }, async function (req, reply) {
    const { playgroundService } = app;
    const { id: userId, githubLogin } = req.user;

    // Get the limit and used.
    let limit = app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT || MAX_DAILY_GENERATE_SQL_LIMIT;
    let used = await playgroundService.countTodayQuestionRequests(userId, false);

    // Give the trusted users more daily requests.
    const trustedLogins = app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS;
    if (trustedLogins.includes(githubLogin)) {
      limit = MAX_DAILY_GENERATE_SQL_LIMIT;
    }

    // Set the headers.
    reply.header(GENERATE_SQL_LIMIT_HEADER, limit);
    reply.header(GENERATE_SQL_USED_HEADER, used);
    reply.send();
  });

  app.post<{
    Body: IBody;
  }>('/', {
    preHandler: [app.authenticate],
    schema
  }, async function (req, reply) {
    const { playgroundService, botService } = app;
    const { question, context: questionContext } = req.body;
    const { id: userId, githubId, githubLogin } = req.user;
    const context = {
      repo_id: questionContext?.repo_id,
      repo_name: questionContext?.repo_name,
      user_id: githubId,
      user_login: githubLogin,
    } as QuestionContext;

    // Get the limit and used.
    let limit = app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT || MAX_DAILY_GENERATE_SQL_LIMIT;
    let used = await playgroundService.countTodayQuestionRequests(userId, false);

    // Give the trusted users more daily requests.
    const trustedLogins = app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS;
    if (trustedLogins.includes(githubLogin)) {
      limit = MAX_DAILY_GENERATE_SQL_LIMIT;
    }

    // Check if the current user reached the daily request limit.
    reply.header(GENERATE_SQL_LIMIT_HEADER, limit);
    if (used >= limit) {
      reply.header(GENERATE_SQL_USED_HEADER, used);
      throw new APIError(429, `You have reached the daily question limit. Please try again tomorrow.`);
    } else {
      reply.header(GENERATE_SQL_USED_HEADER, used + 1);
    }

    let sql;
    try {
      // FIXME: fix the type definition of questionContext.
      // @ts-ignore
      sql = await botService.questionToSQL(question, context);
      if (!sql) {
        throw new APIError(500, 'No SQL generated');
      }
      await playgroundService.recordQuestion({
        userId,
        context,
        question,
        sql: sql,
        success: true,
        preset: false
      });
    } catch (err) {
      await playgroundService.recordQuestion({
        userId,
        context,
        question,
        sql: null,
        success: false,
        preset: false
      });
      throw err;
    }

    if (sql) {
      reply.send({
        sql: sql
      });
    } else {
      reply.status(404).send({
        message: 'No SQL found.'
      });
    }
  });
}

export default root;
