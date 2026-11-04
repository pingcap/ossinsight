import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import fs from "fs/promises";
import {tmpdir} from "os";
import path from "path";
import {Question, QuestionStatus} from "../../../plugins/services/explorer-service/types";
import {APIError} from "../../../utils/error";
import {waitForAnswer} from "../../../utils/answer-wait";
import {saveQueryResultToSqlite} from "../../../utils/sqlite";

const schema = {
  summary: 'Get answer of a new question',
  description: 'Answer a question to the AI bot, he will return a sql query, and execute the query to get the result.',
  tags: ['explorer'],
  body: {
    type: 'object', additionalProperties: false, required: ['question'],
    properties: {
      question: { type: 'string', minLength: 1, maxLength: 512 },
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
    schema,
    preValidation: app.authenticate,
    config: {rateLimit: {max: 20, timeWindow: '1 minute'}},
  }, async function (req, reply) {
    const { question: questionTitle, ignoreCache, format = AnswerFormat.JSON } = req.body;

    // Create question.
    const userId = await app.userService.getUserIdOrCreate(req);
    const question = await app.explorerService.newQuestion(userId, questionTitle, ignoreCache);
    if (!question || question.userId !== userId) {
      throw new APIError(500, 'Failed to create question.');
    }

    // A cache hit belongs to an existing question. Reading it must never reset it.
    let resolvedQuestion: Question = question;
    if (!question.hitCache) {
      try { resolvedQuestion = await app.explorerService.prepareQuestion(question, false); }
      catch { throw new APIError(500, 'Failed to prepare answer.'); }
    }
    resolvedQuestion = await app.explorerService.getQuestionByIdOrError(resolvedQuestion.id);
    resolvedQuestion = await waitForAnswer(
      resolvedQuestion,
      id => app.explorerService.getQuestionByIdOrError(id),
      () => req.raw.aborted || reply.raw.destroyed,
    );

    if (resolvedQuestion.status === QuestionStatus.Error) {
      throw new APIError(500, 'Failed to execute answer.', undefined, convertQuestionToPayload(resolvedQuestion));
    }

    if (resolvedQuestion.status === QuestionStatus.Cancel) {
      throw new APIError(500, 'The question has been canceled.', undefined, convertQuestionToPayload(resolvedQuestion));
    }

    if (format === AnswerFormat.SQLITE) {
      const dir = await fs.mkdtemp(path.join(tmpdir(), 'ossinsight-answer-'));
      try {
        const dbName = `answer-${question.id}.db`;
        const dbFile = path.join(dir, dbName);
        await saveQueryResultToSqlite(resolvedQuestion.result!, dbFile);
        const buffer = await fs.readFile(dbFile);
        reply.type('application/octet-stream');
        reply.header('Content-Disposition', `attachment; filename="${dbName}"`);
        reply.send(buffer);
      } catch {
        throw new APIError(500, 'Failed to export answer.');
      } finally {
        await fs.rm(dir, {recursive: true, force: true});
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
      error: question.error ? 'Answer unavailable.' : undefined,
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
