import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {Question, QuestionStatus} from "../../../../plugins/services/explorer-service/types";
import {APIError} from "../../../../utils/error";
import sleep from "../../../../utils/sleep";

const schema = {
  summary: 'Answer new a question (full response)',
  description: 'Answer a question to the AI bot, he will return a sql query, and execute the query to get the result.',
  tags: ['explorer'],
  body: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      ignoreCache: { type: 'boolean', default: false }
    }
  } as const
};

export interface IBody {
  question: string;
  ignoreCache: boolean;
}

export const newQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', {
    schema
  }, async function (req, reply) {
    const { question: questionTitle, ignoreCache } = req.body;

    // Create question.
    const question = await app.explorerService.newQuestion(0, questionTitle, ignoreCache, true, false, null, 10);
    if (!question) {
      throw new APIError(500, 'Failed to create question.');
    }

    // Prepare question and generate the SQL.
    let resolvedQuestion: Question = question;
    try {
      resolvedQuestion = await app.explorerService.prepareQuestion(question, false);
    } catch (err: any) {
      const msg = `Failed to prepare question ${question.id}: ${err.message}`;
      app.log.error(err, msg);
      throw new APIError(500, msg);
    }

    // Wait for the SQL executed.
    while ([QuestionStatus.Running, QuestionStatus.Waiting].includes(resolvedQuestion.status)) {
      const q = await app.explorerService.getQuestionById(resolvedQuestion.id);
      if (!q) {
        throw new Error(`Question ${resolvedQuestion.id} not found.`);
      }
      resolvedQuestion = q;
      await sleep(1000);
    }

    reply.status(200).send(question);
  });
}

export default newQuestionHandler;
