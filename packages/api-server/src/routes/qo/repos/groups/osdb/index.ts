import { FastifyPluginAsync } from 'fastify';
import { APIError } from '../../../../../utils/error';

const root: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: { format?: string } }>('/', async (request) => {
    if (request.query.format === 'global_variable') {
      throw new APIError(406, 'Use the JSON representation.');
    }
    return fastify.collectionService.getOSDBRepoGroups();
  });
};

export default root;
