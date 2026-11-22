# Web Explorer execution boundary

Web Explorer remains in maintenance mode. The ask route returns the existing
503 response before parsing input, rate-limit storage, model calls or SQL. This
change is a prerequisite for a later feature rollout, not approval to enable it.

## Generated SQL

`executeGeneratedExplorerPlan` applies `@ossinsight/sql-policy` before opening a
connection. The API server uses the same policy through an adapter that preserves
its existing `BadParamsError` response contract. The policy parses one MySQL
SELECT, checks physical tables and functions through nested queries, CTEs and
UNIONs, rejects non-read operations and serializes the authorized tree. Public
cross-repository analysis remains supported.

The Web result is capped at 101 rows at the outer result level: show 100 and use
the extra row for the existing truncated flag. Literal text containing `limit`,
an inner LIMIT and an oversized requested limit cannot bypass this cap. A small
result does not guarantee a cheap scan or a small cell value.

## Database account and session

Before any future enablement, provision and review these Web server variables:

- `EXPLORER_ANALYTICS_DATABASE_URL`: a separate generated-query account.
- `EXPLORER_ANALYTICS_DATABASE`: the explicit database name.

There is no fallback to `EXPLORER_DATABASE_URL`, which continues to serve trusted
question/history/tag queries. Do not replace those existing credentials with the
analytics account: recommendation and tag queries use other application tables.

The analytics account must have direct SELECT grants on only the public tables
it needs from `github_events`, `github_repos`, `github_users`,
`github_repo_topics`, and `trending_repos`. Broad schema grants, roles, delegation,
private tables and write privileges are rejected. Each generated plan verifies
the actual database and current grants on its own connection before execution.
Provisioning, secret storage, rotation and deployment are separate operator work;
no new production identity or permission is created by this code change.

The connection sets and reads back a five-second `max_execution_time` and the
same `STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION` parsing mode as the API server.
If either does not persist, generated SQL is refused. This prevents a server
using different backslash/identifier semantics from reinterpreting authorized
SQL. Model optimizer hints are removed during parse/serialization. The SDK's
session header is carried through metadata checks, setup, query and EXPLAIN.

The overall SDK transport has a 15-second deadline and accepts caller aborts.
Transport cancellation alone is not evidence that the server stopped work.
TiDB's SELECT limit is approximate, and on modern TiDB it does not bound all
statement types or planning work. See [TiDB timeout behavior](https://docs.pingcap.com/tidb/stable/dev-guide-timeouts-in-tidb/)
and [max_execution_time](https://docs.pingcap.com/tidb/stable/system-variables/#max_execution_time).
Existing model budgets, quotas, fleet capacity and deployment verification remain
part of any future enablement review.

## Verification

Build the shared package and run both consumers:

```sh
pnpm --filter @ossinsight/api-server... -r build
pnpm --filter @ossinsight/api-server test:security
pnpm --filter web test:security
pnpm --filter web build
```

Web regressions use the real pinned serverless SDK with a synthetic fetch peer.
They verify the generated wire SQL and session chain, rejection before requests,
independent history behavior, privilege and SQL-mode checks, caller aborts and
deadline cleanup. Maintenance tests verify that ordinary and malformed requests
still return 503 without model, database or Redis work. Existing API SQL/grant
tests exercise the extracted policy; CI additionally runs the existing real
TiDB executor and grant regressions. A synthetic SDK peer is not evidence of a
successful live TiDB Cloud rollout.
