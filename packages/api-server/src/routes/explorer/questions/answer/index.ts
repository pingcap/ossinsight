import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {DateTime} from "luxon";
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

    // Get latest question object.
    resolvedQuestion = await app.explorerService.getQuestionByIdOrError(resolvedQuestion.id);

    // Wait for the SQL executed.
    let start = DateTime.now();
    while ([QuestionStatus.Running, QuestionStatus.Waiting].includes(resolvedQuestion.status)) {
      resolvedQuestion = await app.explorerService.getQuestionByIdOrError(resolvedQuestion.id);
      await sleep(1000);

      const spent = DateTime.now().diff(start);
      if (spent.minutes > 8) {
        throw new APIError(500, 'Failed to execute SQL: timeout');
      }
    }

    reply.status(200).send({
      question: {
        title: resolvedQuestion.title,
        revisedTitle: resolvedQuestion.revisedTitle,
        link: 'https://ossinsight.io/explore/?id=' + resolvedQuestion.id,
      },
      query: {
        sql: resolvedQuestion.querySQL,
      },
      result: resolvedQuestion.result
    });
  });
}

export default newQuestionHandler;
