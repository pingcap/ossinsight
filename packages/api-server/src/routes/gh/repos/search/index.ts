import { FastifyPluginAsync } from 'fastify';
import {githubSearchKeywordSchema} from '../../../../utils/github-public';

interface IQueryString {
  keyword: string;
}

export const schema = {
  querystring: {
    type: 'object',
    required: ['keyword'],
    properties: {
      keyword: {
        ...githubSearchKeywordSchema,
        description: 'The keyword to search repos.',
      }
    }
  }
}

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get<{
    Querystring: IQueryString;
  }>('/', { schema }, async function (req, reply) {
    const res = await app.githubService.searchRepos(req.query.keyword);
    reply.send(res);
  })
}

export default root;
