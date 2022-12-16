import { FastifyPluginAsync } from 'fastify';

export const schema = {
    description: 'Get the result of a query',
    tags: ['playground'],
    querystring: {
        type: 'object',
        required: ['executionId'],
        properties: {
            executionId: {
                type: 'number',
            },
        }
    }
};

export interface IQueryString {
    executionId: number;
}
const root: FastifyPluginAsync = async (app) => {
    app.get<{
        Querystring: IQueryString
    }>('/', {
        schema,
        preHandler: [app.authenticate]
    },async (req, reply) => {
        const { executionId } = req.query;
        const res = await app.playgroundService.getQueryResult(executionId);
        reply.status(200).send(res);
    });
};

export default root;
