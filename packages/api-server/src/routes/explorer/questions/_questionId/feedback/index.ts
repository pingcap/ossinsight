import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {QuestionFeedbackType} from "../../../../../plugins/services/explorer-service/types";
import {Auth0User, parseAuth0User} from "../../../../../plugins/services/user-service/auth0";

export const addFeedbackSchema: FastifySchema = {
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

export const getFeedbacksSchema: FastifySchema = {
  summary: 'Get feedbacks for answer',
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

export const cancelFeedbacksSchema: FastifySchema = {
  summary: 'Cancel feedback for answer',
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
  querystring: {
    type: 'object',
    required: ['satisfied'],
    properties: {
      satisfied: {
        type: 'boolean',
      },
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

export interface IQueryString {
  satisfied: boolean;
}

const root: FastifyPluginAsync = async (app) => {
  // Get feedbacks.
  app.get<{
    Params: IParam
  }>('/', {
    schema: getFeedbacksSchema,
    // @ts-ignore
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization
    );

    const feedbacks = await app.explorerService.getUserQuestionFeedbacks(userId, questionId);
    reply.status(200).send(feedbacks);
  });

  // Add feedback.
  app.post<{
    Params: IParam,
    Body: IBody
  }>('/', {
    schema: addFeedbackSchema,
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
      await app.explorerService.removeUserQuestionFeedbacks(userId, questionId, conn);
      await app.explorerService.addQuestionFeedback({
        questionId,
        userId,
        satisfied,
        feedbackType: satisfied ? QuestionFeedbackType.AnswerSatisfied : QuestionFeedbackType.AnswerUnsatisfied,
        feedbackContent
      }, conn);
      await conn.commit();
      reply.status(200).send({
        message: 'ok'
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      await conn.release();
    }
  });

  // Cancel feedback.
  app.delete<{
    Params: IParam,
    Querystring: IQueryString
  }>('/', {
    schema: cancelFeedbacksSchema,
    // @ts-ignore
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const { satisfied } = req.query;
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization,
    );

    try {
      await app.explorerService.cancelUserQuestionFeedback(userId, questionId, satisfied);
      reply.status(200).send({
        message: 'ok'
      });
    } catch (err) {
      throw err;
    }
  });
};

export default root;
