-- Apply before deploying the pipeline worker. Stop older workers first.
-- This migration is additive and does not rewrite existing job history.
CREATE TABLE IF NOT EXISTS sys_pipeline_locks (
  pipeline_name VARCHAR(128) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY
);
