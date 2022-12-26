import { FastifyPluginAsync } from 'fastify';

export const schema = {
    summary: 'Get Query Result',
    description: 'Get the result of a query',
    tags: ['explorer'],
    querystring: {
        type: 'object',
        required: ['executionId'],
        properties: {
            executionId: {
                type: 'string',
            },
        }
    }
};

export interface IQueryString {
    executionId: string;
}
const root: FastifyPluginAsync = async (app) => {
    app.get<{
        Querystring: IQueryString
    }>('/', {
        schema,
        preHandler: [app.authenticate]
    },async (req, reply) => {
        const { executionId } = req.query;
        const conn = await app.mysql.getConnection();
        try {
            const res = await app.playgroundService.getQueryResult(conn, executionId);
            reply.status(200).send(res);
        } finally {
            conn.release();
        }
    });
};

export default root;
