import {FastifyPluginAsync, FastifySchema} from 'fastify';

export const schema: FastifySchema = {
  summary: 'Get a summary for the answer',
  tags: ['explorer'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: {
        type: 'string',
      },
    }
  }
};

export interface IParam {
  questionId: string;
}

const root: FastifyPluginAsync = async (app) => {
  app.post<{
    Params: IParam,
  }>('/', {
    schema,
    // @ts-ignore
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const summary = await app.explorerService.getQuestionAnswerSummary(questionId);
    reply.status(200).send(summary);
  });
};

export default root;
