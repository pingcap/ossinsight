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
    preHandler: [app.authenticate]
  }, async function (req, reply) {
    const { explorerService } = app;
    let { id: userId, githubLogin } = req.user;
    const { question: questionTitle } = req.body;
    const conn = await this.mysql.getConnection();

    try {
      const question = await explorerService.newQuestion(conn, userId, githubLogin, questionTitle);
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
