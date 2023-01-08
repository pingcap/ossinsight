import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

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

export interface IBody {
  question: string;
}

export const newQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', {
    schema,
    // @ts-ignore
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { explorerService } = app;
    const { sub } = req.user as {
      sub: string;
    };
    const userId = await app.userService.findOrCreateUserByAuth0Sub(sub, req.headers.authorization);
    const { question: questionTitle } = req.body;
    const conn = await this.mysql.getConnection();

    try {
      const question = await explorerService.newQuestion(conn, userId, sub, questionTitle);
      const preceding = await explorerService.countPrecedingQuestions(conn, question.id);
      reply.status(200).send({
        ...question,
        queuePreceding: preceding,
      });
    } catch (e) {
      throw e;
    } finally {
      conn.release();
    }
  });
}

export default newQuestionHandler;
