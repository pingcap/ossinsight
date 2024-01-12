import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

const recommendQuestionSchema = {
  summary: 'Recommend question',
  tags: ['explorer'],
  params: {
    type: 'object',
    properties: {
      questionId: { type: 'string' }
    }
  }
};

export interface recommendQuestionParams {
  questionId: string;
}

export const recommendQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Params: recommendQuestionParams;
  }>('/', {
    schema: recommendQuestionSchema,
    preValidation: app.authenticate
  }, async function (req, reply) {
    const { questionId } = req.params;

    // Only trusted users can recommend questions.
    const userId = await app.userService.getUserIdOrCreate(req);
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    // Recommend question.
    await app.explorerService.recommendQuestion(questionId);
    reply.status(200).send({
      message: "OK"
    });
  });
}

export default recommendQuestionHandler;
