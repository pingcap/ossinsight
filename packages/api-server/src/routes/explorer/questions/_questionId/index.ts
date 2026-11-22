import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {QuestionStatus} from "../../../../plugins/services/explorer-service/types";
import {authenticateQuestionReader, getReadableQuestion, questionIdSchema, questionResponse} from '../../../../utils/explorer-access';

export const schema: FastifySchema = {
    summary: 'Get Question Result',
    description: 'Return the question result',
    tags: ['explorer'],
    params: {
        type: 'object',
        required: ['questionId'],
        properties: {
            questionId: questionIdSchema,
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
        schema,
        preValidation: authenticateQuestionReader(app),
    },async (req, reply) => {
        const { questionId } = req.params;
        const question = await getReadableQuestion(app, req, questionId);
        const preceding = question.status === QuestionStatus.Waiting
            ? await app.explorerService.countPrecedingQuestions(questionId) : 0;
        reply.status(200).send(questionResponse(question, preceding));
    });
};

export default root;
