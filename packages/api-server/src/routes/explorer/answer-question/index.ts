import {APIError} from "../../../utils/error";
import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {
  QueryPlaygroundSQLPromptTemplate
} from "../../../plugins/services/bot-service/template/QueryPlaygroundPromptTemplate";
import {PlaygroundService} from "../../../plugins/services/playground-service";
import {BotService} from "../../../plugins/services/bot-service";

export interface IBody {
  question: string;
}

const schema = {
  summary: 'Answer a question',
  description: 'Answer a question to the AI bot, he will return a sql query, and execute the query to get the result.',
  tags: ['explorer'],
  body: {
    type: 'object',
    properties: {
      question: { type: 'string' },
    }
  } as const
};

const root: FastifyPluginAsyncJsonSchemaToTs = async (app, opts): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', {
    schema,
    preHandler: [app.authenticate]
  }, async function (req, reply) {
    const { playgroundService, botService } = app;
    let userId = req.user?.id;
    let ip = req.ip;
    const { question } = req.body;

    let querySQL = await getQuerySQL(playgroundService, botService, question);
    if (!querySQL) {
      // TODO: fallback to use another way to answer the question.
      throw new APIError(500, 'Failed to generate SQL.');
    }

    // Submit the SQL to the playground.
    const res = await playgroundService.submitQueryJob(querySQL, true, userId, ip);

    reply.status(200).send(res);
  });
}

async function getQuerySQL(playgroundService: PlaygroundService, botService: BotService, question: string): Promise<string | null> {
  // Check if there are same questions in the database.
  const questionRecords = await playgroundService.getExistedQuestion(question);
  if (questionRecords.length > 0) {
    const {sql} = questionRecords[0];
    if (sql) {
      return sql;
    }
  }

  // Generate the SQL by OpenAI.
  let querySQL = null, success = true;
  try {
    const promptTemplate = new QueryPlaygroundSQLPromptTemplate();
    querySQL = await botService.questionToSQL(promptTemplate, question, {});
  } catch (err) {
    success = false;
    throw err;
  } finally {
    await playgroundService.recordQuestion({
      userId: 0,
      context: {},
      question,
      sql: querySQL,
      success,
      preset: false
    });
  }

  return querySQL;
}

export default root;
