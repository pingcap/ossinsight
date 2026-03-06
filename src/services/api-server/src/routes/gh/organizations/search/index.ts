import { FastifyPluginAsync } from 'fastify';
import {UserType} from "../../../../plugins/services/github-service";

interface IQueryString {
  keyword: string;
}

export const schema = {
  querystring: {
    type: 'object',
    required: ['keyword'],
    properties: {
      keyword: {
        type: 'string',
        description: 'The keyword to search users.',
      }
    }
  }
}

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get<{
    Querystring: IQueryString;
  }>('/', { schema }, async function (req, reply) {
    const res = await app.githubService.searchUsers(req.query.keyword, UserType.ORG);
    reply.send(res);
  })
}

export default root;
