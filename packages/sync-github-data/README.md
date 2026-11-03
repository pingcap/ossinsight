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

### Email pseudonymization key

Set `ENCODE_EMAIL_SECRET_KEY` to a securely generated secret of at least 32 bytes
before importing user email addresses. The importer fails closed without it; no
shared fallback key is available. Keep this value in the deployment secret store,
separate from source and logs. For example, generate a value with `openssl rand
-base64 32` and provision it through your normal secret-management process.

For a direct HMAC-key rotation, re-import original profiles: existing hashes
cannot be converted to `HMAC(newKey, originalLocalPart)` without the original
input. Coordinate consumers that match pseudonyms before rotating a key.

For a large legacy dataset, an alternative migration is available. It produces
`HMAC(newPrivateKey, oldPseudonymLocalPart)` and retains the domain. Set
`ENCODE_EMAIL_LEGACY_ENCODING_KEY` explicitly to the retired deployment's actual
encoding key. Subsequent imports first apply that legacy encoding, then the
mandatory private output key, so valid addresses produce exactly the migrated value. There
is no built-in legacy key and it can never replace `ENCODE_EMAIL_SECRET_KEY`.
The legacy encoding key is only a compatibility input; security relies on the
fresh private output key. Keep both settings after this migration. Removing or
changing either requires a separately planned re-import/rotation.

#### Bounded legacy migration

Stop every user-profile writer before beginning. Build this package with Node 24
and deploy the matching importer before allowing it to restart. The importer
checks migration completion and key fingerprints before contacting GitHub or
writing profiles. Back up the current deployment configuration separately.

An administrator can apply `migrations/001_email_rekey_state.sql` before the
rollout. With this table present, the migration account needs only `SELECT,
UPDATE` on `github_users` and `SELECT, INSERT, UPDATE` on `sys_email_rekey_state`;
it does not need DDL privileges. Initialization creates the table automatically
only when it is absent and the connection is authorized to create it. The normal
importer needs read access to the checkpoint in addition to its profile-writing
permissions.

Prepare a private `0600` environment file containing `DATABASE_URL`, the fresh
`ENCODE_EMAIL_SECRET_KEY`, the explicitly configured
`ENCODE_EMAIL_LEGACY_ENCODING_KEY`, and an independent 32-byte, base64-encoded
`EMAIL_REKEY_BACKUP_KEY`. Generate the two new keys securely, keep them out of
shell arguments/logs, and retain a recoverable copy in the deployment's secret
store. The normal importer does not need the backup encryption key.

```sh
# Read-only shape/count sample; no schema or profile changes.
node --env-file=.env.rekey dist/commands/users/rekey-emails.js

# Start with a small, bounded run and inspect its checkpoint and backups.
node --env-file=.env.rekey dist/commands/users/rekey-emails.js --apply \
  --backup-dir /absolute/private/backup-directory --batch-size 100 --max-batches 10

# Inspect progress without starting more work.
node --env-file=.env.rekey dist/commands/users/rekey-emails.js --status
```

Each batch saves an AES-256-GCM encrypted, authenticated backup of the before and
after values and syncs it to disk before writing the database. The backup
directory must be owned by the service user with mode `0700`; files use `0600`.
The tool reserves at least 10 GiB of free disk space and bounds batches to 5,000
rows. It scans by primary key rather than offsets, pauses between batches, and
logs only counts, IDs, elapsed time and safe error codes. Unknown encodings stop
the batch without deleting a value. The legacy empty-domain form is preserved;
invalid fresh addresses still follow the importer's existing empty-value policy.

The data changes and `sys_email_rekey_state` checkpoint commit together in a
pessimistic transaction. Compare-and-swap predicates reject concurrent profile
changes, and a checkpoint lock serializes duplicate migrators. Restarts reuse
matching backups and continue after the committed cursor without wrapping a
value twice. Key mismatches and insufficient backup space fail closed. The
initial maximum ID is fixed; keep writers stopped until the migration is complete.

After a small run, decrypt and verify a backup with `decodeEmailBackup` from
`dist/utils/email-rekey`, check database load, and increase the explicit batch
budget only as appropriate. Preserve the encrypted backups and their separate
key. If rollback is necessary, restore a recorded before value only when the
current value still equals its recorded after value; also reconcile the migration
checkpoint while writers remain stopped. Never reset a cursor over migrated rows.

When the checkpoint reports `complete: true`, verify matching fresh-import
pseudonyms and restart only the new importer with the same output and legacy
encoding keys. Do not restart a retired importer during or after this migration.

### Database transport and runtime

User/repository imports and star snapshots use a shared Prisma connection policy:
certificate verification is mandatory and connection, pool and socket timeouts
are bounded. Explicit insecure or duplicated `sslaccept` parameters are replaced
with `strict`. The maintenance MySQL client also verifies certificates and host
names; an optional `DB_SSL_CA` selects a CA bundle. Tests can connect without TLS
only to an exact loopback host in `NODE_ENV=test`.

See [Prisma's MySQL connection options](https://docs.prisma.io/docs/orm/v6/overview/databases/mysql)
for certificate settings. Build the matched Prisma CLI/client versions and run
`pnpm test:security` before deployment. GitHub workers quarantine revoked or
suspended credentials, and their logs contain fingerprints rather than token
suffixes or raw request errors.
