import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {APIError} from "../../../../../utils/error";
import {
  GenerateQuestionsPromptTemplate
} from "../../../../../plugins/services/bot-service/template/GenerateQuestionsPromptTemplate";
import { Auth0User, parseAuth0User } from "../../../../../plugins/services/user-service/auth0";

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
    // @ts-ignore
    preValidation: app.authenticate,
  }, async function (req, reply) {
    const { botService, explorerService } = app;
    const { metadata } = parseAuth0User(req.user as Auth0User);
    const { n } = req.body;

    // Only admin can generate recommend questions.
    const trusted = app.config.PLAYGROUND_TRUSTED_GITHUB_LOGINS;
    if (!Array.isArray(trusted) || !trusted.includes(metadata.github_login || '')) {
      throw new APIError(403, 'Forbidden');
    }

    const conn = await this.mysql.getConnection();
    try {
      const questions = await botService.generateRecommendQuestions(promptTemplate, n);
      await explorerService.saveRecommendQuestions(conn, questions);
      reply.status(200).send(questions);
    } catch (e) {
      throw e;
    } finally {
      conn.release();
    }
  });
}

export default recommendQuestionHandler;
