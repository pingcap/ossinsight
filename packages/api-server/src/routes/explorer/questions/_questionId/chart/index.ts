import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {Auth0User, parseAuth0User} from "../../../../../plugins/services/user-service/auth0";
import {APIError} from "../../../../../utils/error";

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
    // @ts-ignore
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const { metadata } = parseAuth0User(req.user as Auth0User);

    if (!metadata?.github_login || !app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS.includes(metadata?.github_login)) {
      throw new APIError(401, 'Only trusted users can access this endpoint');
    }

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
