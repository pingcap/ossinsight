# Pipeline service

The scheduler and historical backfill endpoint use the same database lock per
pipeline. Processing SQL and its `SUCCEED` marker commit together. Replaying an
already completed backfill window is a no-op; regular scheduled refreshes still
run again to incorporate late-arriving events. SQL windows are `[from, to)` in UTC.

Before deploying this version:

1. Stop and drain old pipeline workers. Do not run old and new workers together.
2. Apply `migrations/001_atomic_pipeline_jobs.sql`, then
   `migrations/002_pipeline_job_lookup_index.sql` to the existing pipeline database.
   They add `sys_pipeline_locks` and a covering index for job reconciliation and
   completed-range lookups. Historical job records are preserved. Apply these
   schema changes with an existing administrative connection; runtime workers
   do not need schema-management privileges.
3. Reconcile legacy `RUNNING` jobs against their actual data before retrying their
   windows. The new worker refuses these ambiguous windows rather than replaying them.
4. Configure the worker's explicit `DATABASE_URL`. The lock table needs only
   `SELECT` if an administrator first inserts one row for every configured
   pipeline, for example `INSERT IGNORE INTO sys_pipeline_locks (pipeline_name)
   VALUES ('calc_events_total_hourly');`. Accounts with `INSERT` can also create
   missing lock rows automatically; workers never need `UPDATE` on this table.
   A missing row without provisioning permission fails before processing SQL.
   Keep the required permissions on job and configured destination tables.
5. Set a private `PIPELINE_OPERATOR_TOKEN` of at least 32 random bytes (maximum
   256 characters) in the deployment secret manager. Send it using
   `Authorization: Bearer <token>` over HTTPS; never include it in a URL or logs.
   With no token configured, operator routes return 503 and cannot start work.
6. Start new workers and confirm authentication failures and a bounded test
   backfill before resuming normal scheduling.

Only the root health response remains unauthenticated. Trigger requests record a
verified token fingerprint as actor, request ID, route, result and source IP.
Rotate the shared token when an operator loses access; use separate worker
instances/tokens when independent operator attribution is required.

Historical triggers accept a valid UTC-convertible `from`/`to` range with whole
seconds and exactly one positive integer interval unit. The span is limited to
20 years and at most 10,000 chunks. A second local trigger for the same active
pipeline returns 409. Database locking also serializes cross-worker execution.
Pipelines without both `:from` and `:to` parameters cannot be historically replayed.

The database CI exercises concurrent replay, single-connection failure handling,
rollback between data writes and completion, and legacy-job reconciliation. It
uses TiDB; validate any TiFlash-specific processing SQL in the target staging
cluster before production rollout.
