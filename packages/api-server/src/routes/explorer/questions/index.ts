import {APIError} from "../../../utils/error";
import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

export interface IBody {
  question: string;
}

const schema = {
  summary: 'Answer new a question',
  description: 'Answer a question to the AI bot, he will return a sql query, and execute the query to get the result.',
  tags: ['explorer'],
  body: {
    type: 'object',
    properties: {
      question: { type: 'string' },
    }
  } as const
};

export const newQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', {
    schema,
    preHandler: [app.authenticate]
  }, async function (req, reply) {
    const { explorerService } = app;
    let userId = req.user?.id;
    const { question: questionTitle } = req.body;
    const conn = await this.mysql.getConnection();

    try {
      conn.beginTransaction();

      // Limit the number of questions the user can answer one day.
      const questionTotal = await explorerService.countUserTodayQuestions(conn, userId);
      if (questionTotal >= 20) {
        throw new APIError(429, 'Too many questions requested today.');
      }

      // Create a new question
      const res = await explorerService.newQuestion(conn, userId, questionTitle);

      await conn.commit();
      reply.status(200).send(res);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  });
}

export default newQuestionHandler;
