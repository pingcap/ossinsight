import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {questionResponse} from '../../../utils/explorer-access';
import {APIError} from '../../../utils/error';

const schema = {
  summary: 'Answer new a question',
  description: 'Answer a question to the AI bot, he will return a sql query, and execute the query to get the result.',
  tags: ['explorer'],
  body: {
    type: 'object', additionalProperties: false, required: ['question'],
    properties: {
      question: { type: 'string', minLength: 1, maxLength: 512 },
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
    preValidation: app.authenticate,
    config: {rateLimit: {max: 20, timeWindow: '1 minute'}}
  }, async function (req, reply) {
    const { question: questionTitle, ignoreCache } = req.body;
    const userId = await app.userService.getUserIdOrCreate(req);
    const question = await app.explorerService.newQuestion(userId, questionTitle, ignoreCache);

    if (!question || question.userId !== userId) {
      throw new APIError(500, 'Failed to create question.');
    }

    // Prepare question async.
    if (!question.hitCache) {
      app.explorerService.prepareQuestion(question).catch(err => {
        app.log.error({event: 'answer_prepare_failed', questionId: question.id}, 'Failed to prepare answer');
      });
    }

    reply.status(200).send(questionResponse(question, question.preceding));
  });
}

export default newQuestionHandler;
