import { FastifyPluginAsync } from 'fastify';

export const schema = {
  summary: 'Execute SQL',
  tags: ['playground'],
  body: {
    type: 'object',
    required: ['sql'],
    properties: {
      sql: {
        type: 'string',
        description: 'The SQL to execute',
      },
      cancelPrevious: {
        type: 'boolean',
        default: true,
        description: 'Indicates whether to cancel the previous queries',
      }
    }
  }
};

export interface IBody {
  sql: string;
  cancelPrevious: boolean;
}

const root: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: IBody
  }>('/', {
    schema,
    preHandler: [app.authenticateAllowAnonymous]
  },async (req, reply) => {
    const { sql, cancelPrevious } = req.body;
    let userId = req.user?.id;
    let ip = req.ip;
    // TODO: validate the SQL.
    const res = await app.playgroundService.submitQueryJob(sql, cancelPrevious, userId, ip);
    reply.status(200).send(res);
  });
};

export default root;
