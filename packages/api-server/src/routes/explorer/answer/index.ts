import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import fs, {mkdirSync} from "fs";
import {DateTime} from "luxon";
import path from "path";
import {Question, QuestionStatus} from "../../../plugins/services/explorer-service/types";
import {APIError} from "../../../utils/error";
import sleep from "../../../utils/sleep";
import {saveQueryResultToSqlite} from "../../../utils/sqlite";

const schema = {
  summary: 'Get answer of a new question',
  description: 'Answer a question to the AI bot, he will return a sql query, and execute the query to get the result.',
  tags: ['explorer'],
  body: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      format: {
        type: 'string',
        enum: ['json', 'sqlite'],
      },
      ignoreCache: { type: 'boolean', default: false }
    }
  } as const
};

export enum AnswerFormat {
  JSON = 'json',
  SQLITE = 'sqlite',
}

export interface IBody {
  question: string;
  format: AnswerFormat;
  ignoreCache: boolean;
}

export const newQuestionHandler: FastifyPluginAsyncJsonSchemaToTs = async (app): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', {
    schema
  }, async function (req, reply) {
    const { question: questionTitle, ignoreCache, format = AnswerFormat.JSON } = req.body;

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
      throw new APIError(500, msg, err, convertQuestionToPayload(resolvedQuestion));
    }

    // Get latest question object.
    resolvedQuestion = await app.explorerService.getQuestionByIdOrError(resolvedQuestion.id);

    // Wait for the SQL executed.
    let start = DateTime.now();
    while ([QuestionStatus.Running, QuestionStatus.Waiting].includes(resolvedQuestion.status)) {
      resolvedQuestion = await app.explorerService.getQuestionByIdOrError(resolvedQuestion.id);
      await sleep(1000);

      const spent = DateTime.now().diff(start);
      if (spent.minutes > 4) {
        throw new APIError(500, 'Failed to finish the answer: timeout', undefined, convertQuestionToPayload(resolvedQuestion));
      }
    }

    if (resolvedQuestion.status === QuestionStatus.Error) {
      throw new APIError(500, resolvedQuestion.error || 'Unknown error', undefined, convertQuestionToPayload(resolvedQuestion));
    }

    if (resolvedQuestion.status === QuestionStatus.Cancel) {
      throw new APIError(500, 'The question has been canceled.', undefined, convertQuestionToPayload(resolvedQuestion));
    }

    if (format === AnswerFormat.SQLITE) {
      try {
        const dir = path.resolve(process.cwd(), '../../temp');
        const dbName = `answer-${question.id}.db`;
        const dbFile = path.resolve(dir, dbName) ;
        mkdirSync(dir, { recursive: true });

        await saveQueryResultToSqlite(resolvedQuestion.result!, dbFile);
        const buffer = fs.readFileSync(dbFile);

        reply.type('application/octet-stream');
        reply.header('Content-Disposition', `attachment; filename="${dbName}"`);
        reply.send(buffer)
      } catch (err: any) {
        throw new APIError(500, `Failed to save query result to sqlite file: ${err.message}`, err, convertQuestionToPayload(resolvedQuestion));
      }
    } else {
      reply.status(200).send(convertQuestionToPayload(resolvedQuestion));
    }
  });
}

export function convertQuestionToPayload(question: Question) {
  return {
    question: {
      title: question.title,
      revisedTitle: question.revisedTitle,
      link: 'https://ossinsight.io/explore/?id=' + question.id,
      status: question.status,
      error: question.error,
      errorType: question.errorType,
    },
    query: {
      sql: question.querySQL,
      spent: question.spent,
      engines: question.engines
    },
    result: question.result
  };
}


export default newQuestionHandler;
