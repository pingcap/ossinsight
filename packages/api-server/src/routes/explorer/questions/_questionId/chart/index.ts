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
    schema
  },async (req, reply) => {
    const { questionId } = req.params;
    const conn = await app.mysql.getConnection();
    try {
      const chartOptions = await app.explorerService.generateChartByQuestionId(conn, questionId);
      reply.status(200).send(chartOptions);
    } finally {
      conn.release();
    }
  });
};

export default root;
