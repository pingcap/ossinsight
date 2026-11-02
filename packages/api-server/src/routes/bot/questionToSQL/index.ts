import {buildPlaygroundContext} from "../../../plugins/services/bot-service/playground-context";
import {APIError} from "../../../utils/error";
import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import { GENERATE_SQL_LIMIT_HEADER, GENERATE_SQL_USED_HEADER, MAX_DAILY_GENERATE_SQL_LIMIT } from "./quota";
import { Auth0User } from "../../../plugins/auth/auth0";

export interface IBody {
  question: string;
  context?: Record<string, any>
}

const schema = {
  body: {
    type: 'object',
    required: ['question', 'context'],
    additionalProperties: false,
    properties: {
      question: { type: 'string', minLength: 1, maxLength: 4000 },
      context: {
        type: 'object',
        required: ['repo_id'],
        additionalProperties: false,
        properties: {
          repo_id: {
            type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER
          },
          repo_name: {
            type: 'string', maxLength: 200,
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
    const userId = await app.userService.getUserIdOrCreate(req);

    const context = buildPlaygroundContext(req.body.context, req.user as Auth0User);

    // Get the limit and used.
    let limit = app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT || MAX_DAILY_GENERATE_SQL_LIMIT;
    if (await app.playgroundService.checkIfTrustedUser(userId)) {
      // Give the trusted users more daily requests.
      limit = MAX_DAILY_GENERATE_SQL_LIMIT;
    }

    // Reserve atomically before any billable work. Both API aliases share this quota.
    reply.header(GENERATE_SQL_LIMIT_HEADER, limit);
    const reservation = await playgroundService.reserveQuestion(userId, context, question, limit);
    reply.header(GENERATE_SQL_USED_HEADER, reservation.used);

    // Generate the SQL.
    let sql = null, success = true;
    try {
      sql = await app.botService.questionToSQL(app.log, question, context);
      if (!sql) throw new APIError(500, 'No SQL generated');
    } catch (err) {
      success = false;
      throw err;
    } finally {
      await playgroundService.finishQuestion(reservation.id, userId, sql, success && Boolean(sql));
    }

    reply.send({
      sql: sql
    });
  });
}

export default root;