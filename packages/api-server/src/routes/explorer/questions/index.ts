import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

const schema = {
  summary: 'Answer new a question',
  description: 'Answer a question to the AI bot, he will return a sql query, and execute the query to get the result.',
  tags: ['explorer'],
  body: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      ignoreCache: { type: 'boolean', default: false }
    }
  } as const
};

export interface IBody {
  question: string;
  ignoreCache: boolean;
}

export const newQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', {
    schema,
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { question: questionTitle, ignoreCache } = req.body;
    const userId = await app.userService.getUserIdOrCreate(req);
    const question = await app.explorerService.newQuestion(userId, questionTitle, ignoreCache);

    if (!question) {
      throw new Error('Failed to create question.');
    }

    // Prepare question async.
    if (!question.hitCache) {
      app.explorerService.prepareQuestion(question).catch(err => {
        app.log.error(err, `Failed to prepare question ${question.id}: ${err.message}`);
      });
    }

    reply.status(200).send(question);
  });
}

export default newQuestionHandler;
