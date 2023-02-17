import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {Auth0User, parseAuth0User} from "../../../../../../plugins/services/user-service/auth0";

const cancelRecommendQuestionSchema = {
  summary: 'Cancel recommend question',
  tags: ['explorer'],
  params: {
    type: 'object',
    properties: {
      questionId: { type: 'string' }
    }
  }
};

export interface cancelRecommendQuestionParams {
  questionId: string;
}

export const cancelRecommendQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Params: cancelRecommendQuestionParams;
  }>('/', {
    schema: cancelRecommendQuestionSchema,
    // @ts-ignore
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { questionId } = req.params;

    // Only trusted users can cancel recommend questions.
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization
    );
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    // Cancel recommend question.
    await app.explorerService.cancelRecommendQuestion(questionId);
    reply.status(200).send({
      message: "OK"
    });
  });
}

export default cancelRecommendQuestionHandler;
