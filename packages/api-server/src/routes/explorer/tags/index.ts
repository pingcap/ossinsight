import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

const schema = {
  summary: 'Get tags list',
  tags: ['explorer']
};

export const getTagsHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.get('/', {
    schema
  }, async function (req, reply) {
    const questionTags = await app.explorerService.getTags();
    reply.status(200).send(questionTags);
  });
}

export default getTagsHandler;
