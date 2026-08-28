# @ossinsight/sync-github-data 🚧

A CLI tool for fetching GitHub user/repo data and persist it to the TiDB Serverless cluster.

Notice: It is designed to capture as much GitHub data as possible, but does not guarantee real-time updates.

## Usage

```shell
# Install dependencies.
pnpm i
# Run the CLI.
pnpm run dev:start
```

## Commands

### Users

#### Sync all users

```shell
pnpm run dev:start users sync-in-batch
```

### Repos

#### Sync all repos

```shell
pnpm run dev:start repos sync-in-batch
```

#### Snapshot daily stargazer counts for collection repos

```shell
pnpm run build
pnpm run start repos snapshot-stars
```

Records today's total stargazer count (GitHub GraphQL `stargazerCount`) and fork count for
every repo that belongs to an active collection into the `sys_repo_star_snapshots` table
(DDL: `configs/materialized_views/sys_repo_star_snapshots/ddl.sql`, applied automatically
via `CREATE TABLE IF NOT EXISTS` on the first write).

**Why this table exists.** Since ~2025-05 the GitHub `/events` firehose no longer delivers a
usable star-event stream, so star rankings can no longer be derived from `WatchEvent` flow in
`github_events`. The plan is to move rankings to **snapshot deltas**: today's `stargazer_count`
minus an earlier day's is a trustworthy "stars gained" signal that does not depend on the
event stream at all (it even accounts for un-stars, which the event stream never did).

**Why it must run daily.** `stargazerCount` is a running total — GitHub exposes no per-day
history. A day without a snapshot is a data point that can never be recovered, and every
missed day widens the window a delta has to span. The job is idempotent: the table's primary
key is `(repo_id, snapshot_day)` and writes use `ON DUPLICATE KEY UPDATE`, so re-running it
on the same day is always safe.

The scheduled entry point is the `.github/workflows/daily-star-snapshots.yml` workflow
(daily cron + manual dispatch). To run it anywhere else, schedule the equivalent of:

```shell
# Required: GITHUB_ACCESS_TOKENS, DATABASE_URL
pnpm run build
pnpm run start repos snapshot-stars
```

Useful flags:

```shell
# Verify without writing to the database (still requires DATABASE_URL to load the repo list).
pnpm run start repos snapshot-stars --dry-run

# Verify without any database credentials at all (repo list given explicitly,
# GITHUB_ACCESS_TOKENS is still required for the GraphQL lookups).
pnpm run start repos snapshot-stars --dry-run --repos=41986369:pingcap/tidb,vuejs/core

# Tune how many repos are looked up per GraphQL request (default: 10, ~1 rate-limit
# point per request), and pin the UTC day the snapshots are recorded under.
pnpm run start repos snapshot-stars --batch-size=10 --snapshot-day=2026-08-27
```

Unresolvable repos (deleted, made private, or renamed without a redirect) are logged,
skipped and counted — a dead repo never fails the run. A summary line
(`repos_processed / snapshots_written / failures`) is printed at the end.

Note: `DATABASE_URL` is validated per command instead of at CLI start-up, so the
credential-free dry-run above works; commands that do touch the database fail with a clear
error when it is missing. `GITHUB_ACCESS_TOKENS` is always required.