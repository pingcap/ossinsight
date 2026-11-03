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
    app.explorerService.refreshRecommendQuestions({userId, requestId: req.id}).then(() => {
      app.log.info({event: 'explorer_batch_completed', actor: `user:${userId}`, requestId: req.id})
    }).catch(() => {
      app.log.error({event: 'explorer_batch_failed', actor: `user:${userId}`, requestId: req.id});
    });
    reply.status(200).send({
      message: 'Trigger success.'
    });
  });
}

export default refreshRecommendQuestionsHandler;
