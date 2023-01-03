import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {APIError} from "../../../../utils/error";

export const schema: FastifySchema = {
    summary: 'Get Question Result',
    description: 'Return the question result',
    tags: ['explorer'],
    params: {
        type: 'object',
        required: ['questionId'],
        properties: {
            questionId: {
                type: 'string',
            },
        }
    }
};

export interface IParams {
    questionId: string;
}

const root: FastifyPluginAsync = async (app) => {
    app.get<{
        Params: IParams
    }>('/', {
        schema
    },async (req, reply) => {
        const { questionId } = req.params;
        const conn = await app.mysql.getConnection();
        try {
            const question = await app.explorerService.getQuestionById(conn, questionId);
            if (!question) {
                throw new APIError(404, 'Question not found');
            }
            reply.status(200).send(question);
        } finally {
            conn.release();
        }
    });
};

export default root;
