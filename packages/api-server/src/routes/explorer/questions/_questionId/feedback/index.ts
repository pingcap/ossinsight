import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {QuestionFeedbackType} from "../../../../../plugins/services/explorer-service/types";
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
    }
  },
  body: {
    type: 'object',
    required: ['satisfied'],
    properties: {
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

export interface IParam {
  questionId: string;
}

export interface IBody {
  satisfied: boolean;
  feedbackContent: string;
}

const root: FastifyPluginAsync = async (app) => {
  app.post<{
    Params: IParam,
    Body: IBody
  }>('/', {
    schema,
    // @ts-ignore
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const { satisfied, feedbackContent } = req.body;
    const conn = await app.mysql.getConnection();
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization,
      conn
    );

    try {
      await conn.beginTransaction();
      await app.explorerService.removeUserQuestionFeedbacks(conn, userId, questionId);
      await app.explorerService.addQuestionFeedback(conn, {
        questionId,
        userId,
        satisfied,
        feedbackType: satisfied ? QuestionFeedbackType.AnswerSatisfied : QuestionFeedbackType.AnswerUnsatisfied,
        feedbackContent
      });
      await conn.commit();
      reply.status(200).send({
        message: 'ok'
      });
    } catch (err) {
      await conn.commit();
      throw err;
    } finally {
      conn.release();
    }
  });
};

export default root;
