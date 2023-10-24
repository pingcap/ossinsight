import { clientWithoutCache } from '@site/src/api/client';
import { isFiniteNumber, notNullish } from '@site/src/utils/value';

export type ChartResult = {
  chartName: string;
  title: string;
  [key: string]: any;
};

export interface Question {
  id: string;
  hash: string;
  userId: number;
  status: QuestionStatus;
  title: string;
  querySQL: string;
  queryHash: string;
  engines: string[];
  queueJobId?: string | null;
  result?: QuestionSQLResult;
  plan?: QuestionSQLPlan[];
  chart?: ChartResult | null;
  recommended: boolean;
  recommendedQuestions?: string[];
  queuePreceding: number;
  createdAt: string;
  requestedAt?: string | null;
  executedAt?: string | null;
  finishedAt?: string | null;
  spent?: number | null;
  answerSummary?: { content: string, hashtags: string[] };
  error?: string | null;
  errorType?: QuestionErrorType | null;
  hitCache?: boolean;

  answer?: QuestionAnswer | null;

  assumption?: string;
  notClear?: string;
  revisedTitle?: string;
  combinedTitle?: string;
  sqlCanAnswer?: boolean;
}

export interface QuestionAnswer {
  assumption?: string;
  chart?: ChartResult;
  combinedTitle?: string;
  deps?: string;
  keywords?: string[] | string;
  links?: string[] | string;
  notClear?: string;
  querySQL?: string;
  revisedTitle?: string;
  sqlCanAnswer?: boolean;
  subQuestions?: string[];
}

export interface QuestionSQLResult {
  fields: Array<{ name: string, columnType: number }>;
  rows: Array<Record<string, any>>;
}

export interface QuestionSQLPlan {
  'id': string;
  'estRows': string;
  'task': string;
  'access object': string;
  'operator info': string;
}

export interface QuestionQueryResult {
  result: QuestionSQLResult;
  executedAt: string;
  finishedAt: string;
  spent: number;
}

export enum QuestionStatus {
  New = 'new',
  AnswerGenerating = 'answer_generating',
  SQLValidating = 'sql_validating',
  Waiting = 'waiting',
  Running = 'running',
  Success = 'success',
  Summarizing = 'summarizing',
  Error = 'error',
  Cancel = 'cancel',
}

export enum QuestionErrorType {
  ANSWER_GENERATE = 'error-answer-generate',
  ANSWER_PARSE = 'error-answer-parse',
  SQL_CAN_NOT_ANSWER = 'error-sql-can-not-answer',
  VALIDATE_SQL = 'error-validate-sql',
  VALIDATE_CHART = 'error-validate-chart',
  QUERY_TIMEOUT = 'error-query-timeout',
  QUERY_EXECUTE = 'error-query-execute',
  EMPTY_RESULT = 'error-empty-result',
  SUMMARY_GENERATE = 'error-summary-generate',
  UNKNOWN = 'error-unknown',
  QUESTION_IS_TOO_LONG = 'error-question-too-long',
}

export interface PlanStep {
  id: number;
  estRows: number;
  actRows?: number;
  task: string;
  accessObject: string;
}

export interface ValidateSQLResult {
  sql: string;
  statementType: string;
}

export async function newQuestion (
  { question, ignoreCache = false }: { question: string, ignoreCache?: boolean },
  options: {
    accessToken?: string;
  },
): Promise<Question> {
  const { accessToken } = options;
  return await clientWithoutCache.post(
    '/explorer/questions/',
    { question, ignoreCache },
    { withCredentials: true, oToken: accessToken },
  );
}

export async function pollQuestion (questionId: string): Promise<Question> {
  return await clientWithoutCache.get(`/explorer/questions/${questionId}`);
}

export async function recommendQuestion (questionId: string, value: boolean, { accessToken }: { accessToken: string }): Promise<void> {
  await clientWithoutCache.post(`/explorer/questions/${questionId}/recommend${value ? '' : '/cancel'}`, {}, { withCredentials: true, oToken: accessToken });
}

export async function getQuestionTags (questionId: string): Promise<QuestionTag[]> {
  return await clientWithoutCache.get(`/explorer/questions/${questionId}/tags`);
}

export async function updateQuestionTags (questionId: string, tags: number[], { accessToken }: { accessToken: string }): Promise<void> {
  await clientWithoutCache.post(`/explorer/questions/${questionId}/tags`, { tagIds: tags }, { withCredentials: true, oToken: accessToken });
}

export type QuestionTemplate = {
  hash: string;
  title: string;
  aiGenerated: 0 | 1;
  questionId: string | null;
  tags: QuestionTag[];
};

export async function generateQuestion (aiGenerated: boolean, n?: number, tagId?: number): Promise<QuestionTemplate[]> {
  const params = {} as any;
  if (isFiniteNumber(n)) {
    params.n = n;
  }
  if (notNullish(tagId)) {
    params.tagId = tagId;
  }

  return await clientWithoutCache.get('/explorer/questions/recommend', { params });
}

type FeedbackMessage = {
  satisfied: boolean;
  feedbackContent?: string;
};

export async function feedback (questionId: string, { satisfied }: FeedbackMessage, oToken: string) {
  await clientWithoutCache.post(`/explorer/questions/${questionId}/feedback`, { satisfied, feedbackContent: '' }, { withCredentials: true, oToken });
  return satisfied;
}

export async function cancelFeedback (questionId: string, satisfied: boolean, oToken: string) {
  await clientWithoutCache.delete(`/explorer/questions/${questionId}/feedback`, { params: { satisfied }, withCredentials: true, oToken });
  return undefined;
}

interface Feedback {
  createdAt: string;
  feedbackContent: string;
  feedbackType: string;
  id: number;
  questionId: string;
  satisfied: 0 | 1;
  userId: number;
}

export async function pollFeedback (questionId: string, oToken: string): Promise<Feedback[]> {
  return await clientWithoutCache.get(`/explorer/questions/${questionId}/feedback`, { oToken });
}

export interface QuestionTag {
  id: number;
  label: string;
  color: string;
  sort: number;
  createdAt: string;
}

export async function getTags (): Promise<QuestionTag[]> {
  return await clientWithoutCache.get('/explorer/tags');
}
