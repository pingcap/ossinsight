import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {
  GenerateQuestionsPromptTemplate
} from "../../../../../plugins/services/bot-service/template/GenerateQuestionsPromptTemplate";

const schema = {
  summary: 'Generate recommend questions',
  description: 'Generate recommend questions by AI generated',
  tags: ['explorer'],
  body: {
    type: 'object',
    properties: {
      n: {
        type: 'number',
        default: '20',
        minimum: 1,
        maximum: 100
      }
    }
  } as const
};

export interface IBody {
  n: number;
}

const promptTemplate = new GenerateQuestionsPromptTemplate();

export const recommendQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', {
    schema,
    preValidation: app.authenticate,
  }, async function (req, reply) {
    const { botService, explorerService } = app;
    const { n } = req.body;

    // Only trusted users can recommend questions.
    const userId = await app.userService.getUserIdOrCreate(req);
    await app.explorerService.checkIfTrustedUsersOrError(userId);

    const questions = await botService.generateRecommendQuestions(promptTemplate, n);
    await explorerService.saveRecommendQuestions(questions);
    reply.status(200).send(questions);
  });
}

export default recommendQuestionHandler;
