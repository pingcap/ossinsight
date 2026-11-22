# Statistics access and historical cleanup

## Separate request recording from maintenance

The API recorder only inserts into `stats_api_requests`. Its runtime account
does not need `UPDATE`, `DELETE`, `ALTER` or `DROP` on this table. Collection
aggregation reads the statistics and updates `collections` using the pipeline
account; it must not gain statistics-write privileges. Keep existing unrelated
application privileges unchanged.

The disposable TiDB test account now has `SELECT, INSERT` on the statistics
table. Integration tests exercise the real recorder and collection SQL under
that restriction and verify that changing/deleting rows or altering/dropping
the table fails. Changing test grants does **not** change a live deployment.

For an existing deployment, an authorized database administrator must:

1. Identify every recorder connection's actual `CURRENT_USER()` and database.
   Inspect direct grants, active/default roles and inherited database/global
   grants. Account labels in configuration are not sufficient. Identify other
   consumers of a shared credential before revoking anything.
2. Save the original grants in a private operations record. Confirm maintenance
   jobs use their own appropriate account. Keep their credentials outside the
   public API environment. Do not copy production grants or principals into a
   public issue.
3. When the excess privileges are direct table grants, apply the following
   **template**, after replacing both account components with the verified
   principal. This is not an automatic migration or a retention job:

   ```sql
   REVOKE UPDATE, DELETE ON gharchive_dev.stats_api_requests
     FROM 'verified_runtime_user'@'verified_runtime_host';
   ```

   A table-level revoke cannot cancel broader or role-derived grants. Resolve
   those separately after inventorying their consumers; do not revoke a whole
   database's privileges to work around this.
4. Open fresh runtime connections. Verify a synthetic minimized record is
   persisted, the ordinary collection task succeeds, and these zero-row
   statements are denied (they must not need real record contents):

   ```sql
   UPDATE gharchive_dev.stats_api_requests SET error=error WHERE 1=0;
   DELETE FROM gharchive_dev.stats_api_requests WHERE 1=0;
   ```

   Remove the synthetic record with the maintenance account. Test destructive
   DDL denials only in a disposable database. Recheck grants after the change;
   do not blindly replay old grants if an unrelated consumer breaks.

TiDB documents the required administrator privileges for
[`REVOKE`](https://docs.pingcap.com/tidbcloud/sql-statement-revoke-privileges/)
and the order of [privilege checks](https://docs.pingcap.com/tidb/stable/privilege-management/).

This prevents the ordinary API credential from modifying existing statistics;
it is not an immutable audit store. The writer can still append false events
if compromised, and a database administrator retains maintenance powers.
`SELECT` remains for existing readers. Operational security events have their
own access and retention requirements.

## Establish the historical-data decision before executing it

The code's rolling-month collection counter establishes a minimum dependency,
not a complete retention policy. Record the data owner, exact UTC cutoff or
retention period, external report consumers, investigation/legal holds, and
whether daily aggregate history is needed. Do not infer this table's lifetime
from another product's security-log policy.

Use metadata first: inspect `information_schema.partitions`, indexes and the
actual `SHOW CREATE TABLE` result. Partition `TABLE_ROWS` values are estimates;
they are not a verified count. A partition name does not establish its lower
or upper bound, and an absent month can make the following partition span
multiple months. Do not run an unbounded `COUNT(*)` or export raw request rows
just to estimate the cleanup.

A reviewed cleanup should specify:

- The exact expired partitions derived from ordered range boundaries, keeping
  every partition needed for the rolling-month collection query. Never drop
  `MAXVALUE` or a partition overlapping retained data.
- Whether to preserve per-day counts/outcomes and collection activity before
  removing old detail. Such aggregates must exclude IPs, origins, arbitrary
  paths and unreviewed parameters. Verify the source-to-aggregate totals using
  bounded work in the database, without exporting raw requests.
- A separate bounded rewrite for sensitive fields in retained legacy rows.
  A non-unique timestamp is not a safe pagination cursor. Establish a stable
  per-partition key or another tested, resumable strategy before rewriting;
  do not loop unrestricted updates over the live table.
- A restricted recovery copy, a tested restore, its owner and expiry, and the
  retention/access of existing database backups. Cleaning the live table does
  not remove old copies. A deletion hold applies to relevant backups too.
- One partition or bounded batch at a time, a fixed cutoff for that run,
  progress receipts containing counts rather than personal data, production
  latency/error thresholds and a stop procedure. Partition DDL can commit
  independently and must not be treated as transactionally reversible.
- A recurring approved cleanup and monitoring of failures. Delayed/backfilled
  writes can reintroduce expired records; partition removal alone does not
  prevent that. Check this before enabling a schedule.

No default retention period or cleanup scheduler is enabled by this change.
Keep the historical-data issue open until the approved live cleanup, retained
legacy rows, access restrictions and relevant backups have all been verified.
Use the deployed TiDB version's [partition documentation](https://docs.pingcap.com/tidb/stable/partitioned-table/)
when preparing and testing the eventual cleanup.
