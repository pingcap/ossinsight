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
        const question = await app.explorerService.getQuestionById(questionId);
        if (!question) {
            throw new APIError(404, 'Question not found');
        }

        if (question.status === QuestionStatus.Error) {
            question.error = app.explorerService.wrapperTheErrorMessage(question.error!);
        }

        if (question.status === QuestionStatus.Waiting) {
            const preceding = await app.explorerService.countPrecedingQuestions(questionId);
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
    });
};

export default root;
