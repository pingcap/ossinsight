/** Pipeline incremental config */
export interface PipelineIncremental {
  timeRange: 'last_day' | 'last_week' | 'last_month' | 'last_year';
}

/** Pipeline config (config.json format) */
export interface PipelineConfig {
  name: string;
  description?: string;
  cron: string;
  incremental?: PipelineIncremental;
}

/** Pipeline execution status */
export enum PipelineStatus {
  Idle = 'idle',
  Running = 'running',
  Success = 'success',
  Error = 'error',
}

/** Pipeline execution record */
export interface PipelineExecution {
  id: number;
  pipeline_name: string;
  status: PipelineStatus;
  started_at: Date;
  finished_at?: Date;
  error?: string;
  rows_affected?: number;
}
