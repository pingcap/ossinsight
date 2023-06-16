import {FastifyPluginAsync, FastifySchema} from 'fastify';
export const schema: FastifySchema = {
  summary: 'Generate chart for answer',
  description: 'Return the chart options to display the answer of the question',
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

export interface IParams {
  questionId: string;
}

const root: FastifyPluginAsync = async (app) => {
  app.post<{
    Params: IParams
  }>('/', {
    schema,
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;

    // Only trusted users can recommend questions.
    const userId = await app.userService.getUserIdOrCreate(app, req);
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    const chartOptions = await app.explorerService.generateChartByQuestionId(questionId);
    reply.status(200).send(chartOptions);
  });
};

export default root;
