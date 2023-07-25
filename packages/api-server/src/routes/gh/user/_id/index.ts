import { FastifyPluginAsync } from 'fastify';

interface IParams {
  id: number;
}

export const schema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'number',
        description: 'The id of the user.',
      }
    }
  }
}

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get<{
    Params: IParams;
  }>('/', { schema }, async function (req, reply) {
    const res = await app.githubService.getUserByID(req.params.id);
    reply.send(res);
  })
}

export default root;
