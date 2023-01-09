import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {QuestionFeedbackType} from "../../../../../plugins/services/explorer-service/types";
import {APIError} from "../../../../../utils/error";
import {Auth0User, parseAuth0User} from "../../../../../plugins/services/user-service/auth0";

export const schema: FastifySchema = {
  summary: 'Add feedback for answer',
  tags: ['explorer'],
  params: {
    type: 'object',
    required: ['questionId'],
    properties: {
      questionId: {
        type: 'string',
      },
      satisfied: {
        type: 'boolean',
      },
      feedbackContent: {
        type: 'string',
        maxLength: 200,
      }
    }
  }
};

export interface IBody {
  questionId: string;
  satisfied: boolean;
  feedbackContent: string;
}

const root: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: IBody
  }>('/', {
    schema,
    // @ts-ignore
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId, satisfied, feedbackContent } = req.body;
    const conn = await app.mysql.getConnection();
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization,
      conn
    );

    try {
      const feedbacks = await app.explorerService.getUserQuestionFeedbacks(conn, userId);
      if (feedbacks > 0) {
        throw new APIError(400, 'You have already given feedback for this question');
      }
      await app.explorerService.addQuestionFeedback(conn, {
        questionId,
        userId,
        satisfied,
        feedbackType: satisfied ? QuestionFeedbackType.AnswerSatisfied : QuestionFeedbackType.AnswerUnsatisfied,
        feedbackContent
      });
      reply.status(200).send({
        message: 'ok'
      });
    } finally {
      conn.release();
    }
  });
};

export default root;
