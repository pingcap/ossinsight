import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {Auth0User, parseAuth0User} from "../../../../../plugins/auth/auth0";

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
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await app.userService.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization
    );
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
