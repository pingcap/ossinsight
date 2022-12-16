import { FastifyPluginAsync } from 'fastify';

export const schema = {
    description: 'Get the explain plan for a query',
    tags: ['playground'],
    querystring: {
        type: 'object',
        required: ['digest'],
        properties: {
            digest: {
                type: 'string',
            }
        }
    }
};

export interface IQueryString {
    digest: string;
}

const root: FastifyPluginAsync = async (app) => {
    app.get<{
        Querystring: IQueryString
    }>('/', {
        schema,
        preHandler: [app.authenticate]
    },async (req, reply) => {
        const { digest } = req.query;
        const res = await app.playgroundService.getQueryExecutionPlan(digest);
        reply.status(200).send(res);
    });
};

export default root;
