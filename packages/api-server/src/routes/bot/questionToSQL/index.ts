import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

const options = {
  schema: {
    body: {
      type: 'object',
      properties: {
        question: { type: 'string' }
      }
    }
  } as const
}

const root: FastifyPluginAsyncJsonSchemaToTs = async (fastify, opts): Promise<void> => {
  fastify.post('/', options, async function (request, reply) {
    const sql = await fastify.botService.questionToSQL(request.body.question);

    if (sql) {
      reply.send({
        sql: sql
      });
    } else {
      reply.status(404).send({
        message: 'No SQL found.'
      });
    }
  });
}

export default root;
