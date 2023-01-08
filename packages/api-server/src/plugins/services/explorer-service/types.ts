import {DateTime} from "luxon";
import {Field} from "../../../core/executor/query-executor/QueryExecutor";
import {RecommendedChart} from "../bot-service/types";

export enum QuestionQueueNames {
    High = "explorer_high_concurrent_queue",
    Low = "explorer_low_concurrent_queue",
}

export interface Question {
  id: string;
  hash: string;
  userId: number;
  status: QuestionStatus;
  title: string;
  querySQL?: string;
  queryHash?: string;
  engines?: string[];
  queueName?: QuestionQueueNames;
  queueJobId?: string | null;
  recommendedQuestions?: string[];
  result?: QuestionSQLResult;
  chart?: RecommendedChart;
  recommended: boolean;
  createdAt: DateTime;
  requestedAt?: DateTime | null;
  executedAt?: DateTime | null;
  finishedAt?: DateTime | null;
  spent?: number | null;
  error?: string | null;
  hitCache: boolean;
}

export interface QuestionSQLResult {
  fields: Field[];
  rows: Record<string, any>[];
}

export interface QuestionQueryResult {
  result: QuestionSQLResult;
  executedAt: DateTime;
  finishedAt: DateTime;
  spent: number;
}

export interface QuestionQueryResultWithChart extends QuestionQueryResult {
  chart: RecommendedChart;
}

export enum QuestionStatus {
  New = "new",
  Waiting = "waiting",
  Running = "running",
  Success = "success",
  Error = "error",
  Cancel = "cancel",
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
