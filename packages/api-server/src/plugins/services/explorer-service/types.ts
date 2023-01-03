import {DateTime} from "luxon";
import {Field} from "../../../core/executor/query-executor/QueryExecutor";

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
  chart?: Record<string, any> | null;
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