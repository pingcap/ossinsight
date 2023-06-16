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
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;

    // Only trusted users can recommend questions.
    const userId = await app.userService.getUserIdOrCreate(app, req);
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    const summary = await app.explorerService.generateAnswerSummaryByQuestionId(questionId);
    reply.status(200).send(summary);
  });
};

export default root;
