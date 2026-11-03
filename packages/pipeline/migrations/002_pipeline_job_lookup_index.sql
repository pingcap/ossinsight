-- Apply before enabling historical backfills on an existing pipeline database.
-- Keep exact-window reconciliation and completed-range lookups off full job scans.
CREATE INDEX IF NOT EXISTS pipeline_range_status ON sys_pipelines_jobs
  (pipeline_name, status, time_range_start, time_range_end);
