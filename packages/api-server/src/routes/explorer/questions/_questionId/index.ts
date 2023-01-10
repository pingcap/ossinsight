import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {APIError} from "../../../../utils/error";
import {QuestionStatus} from "../../../../plugins/services/explorer-service/types";

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
            const question = await app.explorerService.getQuestionById(questionId, conn);
            if (!question) {
                throw new APIError(404, 'Question not found');
            }

            if (question.status === QuestionStatus.Error) {
                app.explorerService.wrapperTheErrorMessage(question);
            }

            if (question.status === QuestionStatus.Waiting) {
                const preceding = await app.explorerService.countPrecedingQuestions(questionId, conn);
                reply.status(200).send({
                    queuePreceding: preceding,
                    ...question
                });
            } else {
                reply.status(200).send({
                    queuePreceding: 0,
                    ...question
                });
            }
        } finally {
            conn.release();
        }
    });
};

export default root;
