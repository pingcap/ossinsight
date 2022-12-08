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

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
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

    const trustedLogins = app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS;
    if (!Array.isArray(trustedLogins) || !trustedLogins.includes(githubLogin)) {
      await playgroundService.checkIfUserHasReachedDailyQuestionLimit(userId);
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
