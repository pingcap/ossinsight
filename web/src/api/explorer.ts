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
  hitCache?: boolean;

  assumption?: string;
  notClear?: string;
  revisedTitle?: string;
  sqlCanAnswer?: boolean;
}

export interface QuestionSQLResult {
  fields: Array<{ name: string, columnType: number }>;
  rows: Array<Record<string, any>>;
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
  question: string,
  options: {
    accessToken?: string;
  },
): Promise<Question> {
  const { accessToken } = options;
  return await clientWithoutCache.post(
    '/explorer/questions/',
    { question },
    { withCredentials: true, oToken: accessToken },
  );
}

export async function pollQuestion (questionId: string): Promise<Question> {
  return await clientWithoutCache.get(`/explorer/questions/${questionId}`);
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
