import {APIError} from "../../../utils/error";
import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {
  QueryPlaygroundSQLPromptTemplate
} from "../../../plugins/services/bot-service/template/QueryPlaygroundPromptTemplate";
import { GENERATE_SQL_LIMIT_HEADER, GENERATE_SQL_USED_HEADER, MAX_DAILY_GENERATE_SQL_LIMIT } from "./quota";
import { Auth0User, parseAuth0User } from "../../../plugins/services/user-service/auth0";

export interface IBody {
  question: string;
  context?: Record<string, any>
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
    // @ts-ignore
    preValidation: app.authenticate,
    schema
  }, async function (req, reply) {
    const { playgroundService, botService } = app;
    const { question } = req.body;
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);

    const conn = await this.mysql.getConnection();

    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization,
      conn
    );
    const context: {
      github_id?: number;
      github_login?: string;
    } = {};
    if (metadata.provider === "github" && metadata.github_id) {
      context.github_id = parseInt(metadata.github_id, 10);
      context.github_login = metadata.github_login;
    }

    try {
      // Check if there are existed SQL
      const questionRecords = await playgroundService.getExistedQuestion(conn, question);
      if (questionRecords.length > 0) {
        const {sql} = questionRecords[0];
        return reply.status(200).send({sql});
      }

      // Get the limit and used.
      let limit = app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT || MAX_DAILY_GENERATE_SQL_LIMIT;
      let used = await playgroundService.countTodayQuestionRequests(conn, userId, false);

      // Give the trusted users more daily requests.
      const trustedLogins = app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS;
      if (trustedLogins.includes(metadata.github_login || '')) {
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

      // Generate the SQL.
      let sql = null, success = true;
      try {
        const promptTemplate = new QueryPlaygroundSQLPromptTemplate();
        sql = await botService.questionToSQL(promptTemplate, question, context);
        if (!sql) {
          throw new APIError(500, 'No SQL generated');
        }
      } catch (err) {
        success = false;
        throw err;
      } finally {
        await playgroundService.recordQuestion(conn, {
          userId,
          context,
          question,
          sql,
          success,
          preset: false
        });
      }

      reply.send({
        sql: sql
      });
    } finally {
      conn.release();
    }
  });
}

export default root;