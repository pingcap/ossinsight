import {FastifyPluginAsync, FastifySchema} from 'fastify';
import {Auth0User, parseAuth0User} from "../../../../../../plugins/services/user-service/auth0";

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
  body: {
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
}

const root: FastifyPluginAsync = async (app) => {
  // Cancel feedback.
  app.delete<{
    Params: IParam,
    Body: IBody
  }>('/', {
    schema: cancelFeedbacksSchema,
    // @ts-ignore
    preValidation: app.authenticate
  },async (req, reply) => {
    const { questionId } = req.params;
    const { satisfied } = req.body;
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
