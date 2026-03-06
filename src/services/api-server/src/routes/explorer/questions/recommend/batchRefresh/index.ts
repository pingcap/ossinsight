import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

const schema = {
  summary: 'Refresh recommend questions',
  description: 'Refresh recommended questions in batch.',
  tags: ['explorer']
};

export const refreshRecommendQuestionsHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post('/', {
    schema,
    preValidation: app.authenticate
  }, async function (req, reply) {
    // Only trusted users can trigger this.
    const userId = await app.userService.getUserIdOrCreate(req);
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    // Trigger refresh.
    app.explorerService.refreshRecommendQuestions().then(() => {
      app.log.info('Refresh recommend questions success.')
    }).catch((err: any) => {
      app.log.error(err, `Failed to refresh recommend questions: ${err.message}`);
    });
    reply.status(200).send({
      message: 'Trigger success.'
    });
  });
}

export default refreshRecommendQuestionsHandler;
