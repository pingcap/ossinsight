import {ProviderType} from "../../../plugins/services/user-service";
import {APIError} from "../../../utils/error";
import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import { GENERATE_SQL_LIMIT_HEADER, GENERATE_SQL_USED_HEADER, MAX_DAILY_GENERATE_SQL_LIMIT } from "./quota";
import { Auth0User, parseAuth0User } from "../../../plugins/auth/auth0";

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

const root: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', {
    preValidation: app.authenticate,
    schema
  }, async function (req, reply) {
    const { playgroundService } = app;
    const { question } = req.body;
    const { metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.getUserIdOrCreate(req);

    // Prepare Context.
    const context: {
      repo_id?: number;
      repo_name?: string;
      github_id?: number;
      github_login?: string;
    } = {
      ...req.body.context,
    };
    if (metadata.provider === ProviderType.GITHUB && metadata.github_id) {
      context.github_id = parseInt(metadata.github_id, 10);
      context.github_login = metadata.github_login;
    }

    // Get the limit and used.
    const used = await playgroundService.countTodayQuestionRequests(userId, false);
    let limit = app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT || MAX_DAILY_GENERATE_SQL_LIMIT;
    if (await app.playgroundService.checkIfTrustedUser(userId)) {
      // Give the trusted users more daily requests.
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
      sql = await app.botService.questionToSQL(app.log, question, context);
    } catch (err) {
      success = false;
      throw err;
    } finally {
      await playgroundService.recordQuestion({
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
  });
}

export default root;