import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";

const schema = {
  summary: 'Get recommend questions',
  description: 'Get recommend questions by AI generated or sort by popularity.',
  tags: ['explorer'],
  querystring: {
    type: 'object',
    properties: {
      aiGenerated: {
        type: 'boolean'
      },
      n: {
        type: 'number',
        default: '10',
        minimum: 1,
        maximum: 30
      }
    }
  } as const
};

export interface IQuerystring {
  aiGenerated?: boolean;
  n: number;
}

export const recommendQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.get<{
    Querystring: IQuerystring;
  }>('/', {
    schema
  }, async function (req, reply) {
    const { aiGenerated, n } = req.query;
    const questions = await app.explorerService.getRecommendQuestions(n, aiGenerated);
    reply.status(200).send(questions);
  });
}

export default recommendQuestionHandler;
