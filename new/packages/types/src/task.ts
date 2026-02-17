import type { PipelineConfig } from './pipeline.js';

/** Task types in the unified scheduler */
export enum TaskType {
  Prefetch = 'prefetch',
  Pipeline = 'pipeline',
  Sync = 'sync',
}

/** Task priority */
export enum TaskPriority {
  Low = 0,
  Normal = 1,
  High = 2,
  Critical = 3,
}

/** Task status */
export enum TaskStatus {
  Pending = 'pending',
  Queued = 'queued',
  Running = 'running',
  Success = 'success',
  Error = 'error',
  Cancelled = 'cancelled',
  Timeout = 'timeout',
}

/** Queue definition */
export interface QueueConfig {
  name: string;
  concurrent: number;
  timeout: number;
}

/** Prefetch job */
export interface PrefetchJob {
  queryName: string;
  refreshQueue: string;
  refreshCron: string;
  params: Record<string, string>;
}

/** Sync job */
export interface SyncJob {
  type: 'repos' | 'users';
  action: 'sync-batch' | 'sync-concurrent' | 'pull' | 'mark-deleted' | 'load-orgs';
  batchSize?: number;
  concurrency?: number;
}

/** Scheduled task definition */
export interface ScheduledTask {
  id: string;
  name: string;
  type: TaskType;
  cron: string;
  enabled: boolean;
  config: PrefetchJob | PipelineConfig | SyncJob;
  priority: TaskPriority;
  timeout: number;
  lastRun?: Date;
  lastStatus?: TaskStatus;
  nextRun?: Date;
}

/** Task execution record */
export interface TaskExecution {
  id: number;
  task_id: string;
  task_name: string;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  started_at: Date;
  finished_at?: Date;
  error?: string;
  metadata?: Record<string, unknown>;
}
