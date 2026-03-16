import { FastifyPluginAsync } from 'fastify';

interface IParams {
  username: string;
  repo: string;
}

export const schema = {
  params: {
    type: 'object',
    required: ['username'],
    properties: {
      username: {
        type: 'string',
        description: 'The username of the user.',
      }
    }
  }
}

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get<{
    Params: IParams;
  }>('/', { schema }, async function (req, reply) {
    const res = await app.githubService.getUserByUsername(req.params.username);
    reply.send(res);
  })
}

export default root;
