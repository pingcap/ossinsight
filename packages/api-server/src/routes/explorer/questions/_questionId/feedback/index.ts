import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {QuestionFeedbackType} from "../../../../../plugins/services/explorer-service/types";
import {withTransaction} from "../../../../../utils/db";

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
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const userId = await app.userService.getUserIdOrCreate(req);

    const feedbacks = await app.explorerService.getUserQuestionFeedbacks(userId, questionId);
    reply.status(200).send(feedbacks);
  });

  // Add feedback.
  app.post<{
    Params: IParam,
    Body: IBody
  }>('/', {
    schema: addFeedbackSchema,
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const { satisfied, feedbackContent } = req.body;
    const userId = await app.userService.getUserIdOrCreate(req);

    // Add or replace feedback.
    await withTransaction(app.mysql, async (conn) => {
      await app.explorerService.removeUserQuestionFeedbacks(conn, userId, questionId);
      await app.explorerService.addQuestionFeedback(conn, {
        questionId,
        userId,
        satisfied,
        feedbackType: satisfied ? QuestionFeedbackType.AnswerSatisfied : QuestionFeedbackType.AnswerUnsatisfied,
        feedbackContent
      });
    });

    reply.status(200).send({
      message: 'ok'
    });
  });

  // Cancel feedback.
  app.delete<{
    Params: IParam,
    Querystring: IQueryString
  }>('/', {
    schema: cancelFeedbacksSchema,
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const { satisfied } = req.query;
    const userId = await app.userService.getUserIdOrCreate(req);

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
