import { clientWithoutCache } from '@site/src/api/client';
// import { RemoteData } from '@site/src/components/RemoteCharts/hook';
//
// export type WaitingAskResult = {
//   sql: string;
//   execution: {
//     'engines': string[];
//     'hitCache': boolean;
//     'id': string;
//     'queryDigest': null;
//     'queryHash': string;
//     'queueCurrentRank': number;
//     'queueInitialRank': number;
//     'status': 'waiting';
//     'enqueue': boolean;
//   };
// };
//
// export type ExecutedAskResult = Exclude<RemoteData<any, any>, 'query'> & {
//   execution: {
//     'engines': string[];
//     'hitCache': boolean;
//     'id': string;
//     'queryDigest': null;
//     'queryHash': string;
//     'queueCurrentRank': number;
//     'queueInitialRank': number;
//     'status': 'success';
//     'enqueue': boolean;
//   };
// };
//
// export type AskResult = WaitingAskResult | ExecutedAskResult;

export type ChartResult = {
  chartName: string;
  title: string;
  [key: string]: any;
};

//
// export async function ask (question: string): Promise<AskResult> {
//   return await clientWithoutCache.post('/explorer/answer-question/', { question }, { withCredentials: true });
// }
//
// export async function getResult (executionId: string): Promise<AskResult> {
//   // TODO: use ws api
//   return await clientWithoutCache.get('/explorer/get-query-result/', { params: { executionId }, withCredentials: true, wsApi: true });
// }
//
// export async function guessChart (params: { question: string, data: any }): Promise<ChartResult> {
//   return await clientWithoutCache.post('/explorer/generate-chart/', params, { withCredentials: true });
// }
//
// export function isWaiting (result: AskResult): result is WaitingAskResult {
//   return result.execution.status === 'waiting';
// }

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
  ai_generated: 0 | 1;
};

export async function generateQuestion (aiGenerated: boolean, n: number): Promise<QuestionTemplate[]> {
  return await clientWithoutCache.get('/explorer/questions/recommend', { params: { aiGenerated, n } });
}

interface FeedbackMessage {
  satisfied: boolean;
  feedbackContent?: string;
}

export async function feedback (questionId: string, { satisfied, feedbackContent = '' }: FeedbackMessage, oToken: string) {
  await clientWithoutCache.post(`/explorer/questions/${questionId}/feedback`, { satisfied, feedbackContent: '' }, { withCredentials: true, oToken });
  return satisfied;
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
