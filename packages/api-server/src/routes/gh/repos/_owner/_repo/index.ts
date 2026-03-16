import { FastifyPluginAsync } from 'fastify';

interface IParams {
  owner: string;
  repo: string;
}

export const schema = {
  params: {
    type: 'object',
    required: ['owner', 'repo'],
    properties: {
      owner: {
        type: 'string',
        description: 'The owner of the repo.',
      },
      repo: {
        type: 'string',
        description: 'The name of the repo.',
      }
    }
  }
}

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get<{
    Params: IParams;
  }>('/', { schema }, async function (req, reply) {
    const res = await app.githubService.getRepoByName(req.params.owner, req.params.repo);
    reply.send(res);
  })
}

export default root;
