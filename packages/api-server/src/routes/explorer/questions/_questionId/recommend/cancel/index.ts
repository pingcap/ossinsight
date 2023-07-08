import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

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
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { questionId } = req.params;

    // Only trusted users can cancel recommend questions.
    const userId = await app.userService.getUserIdOrCreate(req);
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    // Cancel recommend question.
    await app.explorerService.cancelRecommendQuestion(questionId);
    reply.status(200).send({
      message: "OK"
    });
  });
}

export default cancelRecommendQuestionHandler;
