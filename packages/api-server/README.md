# API Server

This project is the API server of OSS Insight.

## Getting started

### Setup Environment Variables

Create a `.env` file in the `/packages/api-server` directory and fill in the following required environment variables:

| Name                   | Description                              | Default                                                                    |
|------------------------|------------------------------------------|----------------------------------------------------------------------------|
| `DATABASE_URL`         | Database URL to connect TiDB/MySQL.      | Required; use a dedicated database account |
| `REDIS_URL`            | URL to connect Redis.                    | `redis://localhost:6379/0`                                                 |
| `GITHUB_ACCESS_TOKENS` | Personal access token of GitHub account. |                                                                            |

If you need to see the complete env file configuration instructions, please see the schema definition on the [./src/env.ts](./src/env.ts) file.

### Install Dependencies

Use Node.js 24 LTS (24.9 or newer) and pnpm 10.29.3. The test commands enable
Node's VM modules so Jest can load the same ESM dependencies as the server.
Install Node.js dependencies with the following command:

```shell
pnpm install --filter @ossinsight/api-server... --frozen-lockfile
```

On Linux images with an older glibc, including Ubuntu 22.04, compile SQLite
against the host libraries. This requires Python, make, and a C++ compiler:

```bash
npm_config_build_from_source=true pnpm --filter @ossinsight/api-server rebuild sqlite3
pnpm --filter @ossinsight/api-server test:runtime
```

### Initialize the Database Schema

TODO

### Start the Server

Start the API server in dev mode with the following command:

```shell
npm run dev
```

Open [http://localhost:3450](http://localhost:3450) to view it in the browser.


## Security boundaries

Public named queries use the reviewed analytics catalog in `@ossinsight/types`.
New queries default to private; explicitly set `public: true` only after reviewing
both the returned data and parameter constraints. `public: false` always overrides
the compatibility catalog. The internal prefetch job opts into private queries.

`/q/playground` and `/explorer/answer` require an authenticated bearer session.
LLM generation reserves the user's daily quota transactionally before calling the
provider, including failed attempts. Cache hits never re-prepare existing answers.
Only registered `/v1` routes can forward requests using Data Service credentials.

Client identity defaults to the socket peer. When deploying behind a reverse
proxy, set `TRUSTED_PROXY_CIDRS` to its exact network ranges (comma separated) and
use the package start command, which enables the exported Fastify options.
The proxy must replace untrusted forwarding headers; never configure all networks
as trusted. Public clients cannot choose their quota identity with IP headers.

### Public query transport limits

Collection-bearing catalog results retain their configured cache and prefetch-only
policy. Before returning cached trending/collection results, the API refreshes
public collection names and memberships with bounded metadata lookups; revoked
or deleted memberships are not served. Metadata failures deny the response.
The source-data incident gate still takes precedence over prefetch and cache access.

SQL Playground uses a 30,000 ms default server statement limit and client timeout.
`PLAYGROUND_QUERY_SQL_TIMEOUT` accepts an integer from 1 to 60,000 milliseconds;
invalid or zero values prevent startup. The legacy
`PLAYGROUND_SESSION_max_execution_time` is accepted when the new setting is absent,
with the same bounds. Other `PLAYGROUND_SESSION_*` values cannot disable the limit.
Explorer workers keep their bounded `EXPLORER_QUERY_SQL_TIMEOUT` setting. Smaller
per-query timeouts apply to the server and client, including shadow connections;
timed-out client connections are destroyed. TiDB enforces server deadlines with
approximately 100 ms precision, as described in its
[max_execution_time documentation](https://docs.pingcap.com/tidb/stable/system-variables/#max_execution_time).
User SQL is parsed and serialized before execution, removing optimizer hints that
could override the session limit. Explorer metrics use one `explorer-sql` label;
question IDs remain in existing diagnostic records instead of metric series.

`PUBLIC_API_HOURLY_RATE_LIMIT` (default 600) caps one client's total requests across
all HTTP routes (including health, Explorer, feedback, new routes and 404s),
WebSocket handshakes and WebSocket queries. CORS preflights and authenticated
`/metrics` and `/docs/json` requests are exempt. Redis reservations are atomic,
failures deny requests, and sockets allow at
most two concurrent queries and 16 KiB messages. Configure `TRUSTED_PROXY_CIDRS` with
only the actual reverse-proxy networks; HTTP and sockets use the same trust boundary.
Export this setting in the process manager environment before starting the API;
the server options are read before the application loads its `.env` file.
The production start command passes `--options` to apply this trust policy.

CORS configuration now lists exact origins. Public consumers receive no credentialed
access. Localhost is enabled only in development. For a trusted preview, explicitly
set its exact origin in `CORS_PRIVATE_ORIGINS`; broad hosting-provider patterns are
not accepted. WebSocket handshakes require a configured Origin, including for CLI
clients. Socket errors and audit events omit raw requests, SQL and internal errors.

### Account registration

Account registration requires a unique, full-column index on
`sys_accounts(provider, provider_account_id)`. The production index is
`index_sa_on_provider_account_id`; the integration-test schema mirrors it.
Each process verifies this invariant before its first new registration, before
fetching a profile or inserting a user. A legacy deployment missing the index must check existing bindings before
adding it; no automated deletion, merge or reassignment of identities is performed.
Existing ambiguous or orphaned account links return a conflict for administrator
review instead of recreating a missing user.

Concurrent first logins insert the user and account in one transaction. A unique
key conflict rolls back the provisional user and reads the committed winner;
deadlock/write-conflict retries are bounded to three attempts. The external
UserInfo request runs outside the transaction, has a five-second deadline, cannot
redirect its bearer token, and must return the authenticated subject. Existing
bindings do not require a UserInfo request.

### Operations access and audit records

Set a private `OPERATIONS_TOKEN` (32–256 characters with at least 32 random bytes)
for the API and prefetch deployments, and configure the Prometheus scraper to send
`Authorization: Bearer <token>`. `/metrics` and `/docs/json` deny unauthenticated
requests; an unconfigured token disables these endpoints with 503. Health checks
remain available. The prefetch metrics listener defaults to `127.0.0.1`; changing
`METRICS_HOST` does not remove token authentication. Apply scraper configuration
before deploying these endpoint restrictions to avoid a monitoring gap.

API audit records include request ID, verified actor, route pattern, concrete resource, source IP,
status and duration. Auth0 principals are recorded only after JWT verification;
privileged operations additionally resolve the stored user ID. Operator access
records a token fingerprint. Reviewed public query names and validated resource
IDs identify the accessed resource. Numeric/enum query parameters are allowlisted;
duplicate, invalid, unknown and free-text parameters are omitted and counted.
These records omit tokens, bodies and raw URLs/querystrings. Unknown query names
and malformed resource segments are redacted rather than copied into logs.
The existing request-statistics table remains a separate analytics sink.
Its Origin/path fields are capped at 255 UTF-8 bytes and IP fields at 128 bytes.
Responses produce one statistics row with the final status, including failures.
Deterministic row-validation errors isolate the bad row without discarding its
neighbors; connection failures retain the bounded whole-batch retry policy.
Failed inserts log counts/error numbers without SQL or buffered request values.
Shutdown waits for outstanding flushes. This sink remains best effort during
database outages; the structured request audit remains independent of it.

The API health route shares one dependency probe per process and caches its result
for five seconds. An HTTP probe waits at most three seconds; a stuck backend probe
is not replaced by further requests. Health HTTP responses remain `no-store`.

Web GitHub searches accept bounded plain terms (at most 100 characters). Invalid
or repeated keywords return an uncached 400 before SQL. All prefix predicates use
bound, escaped parameters with explicit `ESCAPE '!'`; equality comparisons retain
the original term. Empty terms and existing recommendation keywords retain their
database-free responses.

### Query cache rollout

Version 3 query keys include the database endpoint, schema and account, environment,
SQL/template configuration, normalized parameters and output format. They contain
only a digest, never credentials. Deploy API and prefetch with matching analytics
source credentials and `NODE_ENV`, and warm the new keys before routing traffic to
queries configured as `onlyFromCache`. Old keys are not reused. In-flight work is
also isolated by backing cache provider. Queries listing multiple collections read
fresh visibility, and responses cannot be pinned in browser/CDN caches after access
is revoked.

### Database transport defaults

`DATABASE_URL` is required; no passwordless root default is supplied. API,
pipeline and prefetch connections enable TLS with certificate and hostname
verification for every non-loopback endpoint. Production also requires TLS on
loopback and rejects root/tenant-root accounts. Development/test loopback databases
may run without TLS. Supply a password and a dedicated least-privilege account;
use the certificate's hostname rather than an uncertified alias or IP address.
For a private CA, provide its PEM content in the URI's JSON `ssl.ca` option.
Disabling `rejectUnauthorized` or `verifyIdentity` is rejected. Identity fields
cannot be overridden through query options. Provision and verify the database
certificate/account before deploying this enforcement.

Privileged recommendation, tag replacement and batch refresh operations also emit
service-level audit events with the verified numeric user ID, request ID, target,
action and outcome. Background refresh items retain the same actor/request
context and a batch ID; partial failures are recorded as failures. Tag audit
records contain bounded numeric tag IDs, never question text or raw exceptions.

### Runtime dependency maintenance

The API and pipeline use Fastify 5. Socket.IO attaches directly to the HTTP server
and closes both established sockets and unfinished transports during shutdown.
`@fastify/redis` stays on its Fastify 5-compatible 8.x line so the API and BullMQ
share the same ioredis 5 client. Keep the queue names and existing credentials when
rolling out dependency updates, and verify both authenticated metrics and the
worker drain procedure below.

`AUTH0_SECRET` accepts a symmetric client secret. Public-key JWT verification uses
`AUTH0_DOMAIN`; PEM keys and certificates cannot be configured as HMAC secrets.
Unsupported signing algorithms and critical JWT header extensions are rejected
before key lookup, and the signature must still verify before an actor is assigned.

Protected user routes also require `AUTH0_AUDIENCE`, the Identifier of the
OSSInsight API registered in Auth0. The configured issuer and exact audience are
verified, tokens must expire, and `AUTH0_ALLOWED_CLIENT_IDS` can restrict `azp` to
a comma-separated list of approved clients. Do not use the Auth0 Management API
or `/userinfo` audience for OSSInsight. The historical website requested a
Management API audience; a client migrating from that website must request the
dedicated OSSInsight audience instead. With no audience configured, protected
routes reject tokens; anonymous analytics and operator authentication continue to
work. Configure and test the client and API audience before enabling user login.

Explorer questions are private to their creator unless a trusted curator
explicitly recommends them. Public reads of recommended questions use a limited
response format without ownership, execution plans, job metadata or raw database
errors. Unpublishing a question immediately removes anonymous access, and all
Explorer responses disable browser/CDN caching. Cached question reuse is scoped
to the creator; identical text from another user creates a separate question.

`pnpm test:security` covers the authentication and transport boundaries.

### Public GitHub metadata

The `/gh/*` API exposes public metadata only. Search accepts a plain term of up to
100 characters; caller-supplied GitHub qualifiers, quotes and wildcards are
rejected. Repository searches apply `in:name is:public` and verify result
visibility. Repository lookups by ID or name reject private/internal results.
Private and nonexistent repositories return the same 404 response.
Responses use public field allowlists and omit viewer permissions, private
profile fields and credential identifiers. Provision GitHub tokens with only the
public metadata access needed for these endpoints.

GitHub cache keys use the `gh:public:v2:` namespace, so historical privileged
responses and token fragments are not reused. Fresh values and cache hits are
projected to the same public response fields; HTTP responses use `no-store`.
`pnpm test:runtime` verifies native SQLite exports and OpenAI response parsing using
synthetic data. The real Redis integration test exercises BullMQ script discovery,
job completion and graceful drain, including the scoped minimatch and UUID updates.
The repository's production dependency audit runs in the security workflow.

### SQL queue worker

The API still produces the two `explorer_*_concurrent_queue` queues. Run their
consumer from this package using Node 24 LTS and `pnpm worker`; old deployments
may have a `packages/job-server` checkout that is no longer in this repository.
The new worker needs only `DATABASE_URL`, `PLAYGROUND_DATABASE_URL`, `REDIS_URL`
and `OPERATIONS_TOKEN` in its private `.env.worker` (separate from the API’s `.env`). It does not need an OpenAI key,
GitHub tokens, Auth0 secrets or Data Service keys, and cannot generate prompts.

Use a metadata account with access to the Explorer records and a separate
analytics account with direct SELECT grants on approved public tables. The
worker checks grants and verified TLS before consuming any jobs. `pnpm
worker:check` validates connectivity, grants and SQL session initialization
without creating queues, consuming jobs or writing application data.
The worker exposes only `/healthy` and authenticated `/metrics` on
`127.0.0.1:30001`. Forward the operations bearer token from any metrics scraper.

Deploy the new worker before this API version: the producer now sends only a
question ID, whereas the old worker expects SQL in the queue payload. Pause
both queues, wait for active jobs to drain, replace the old worker, then deploy
the API and resume the queues. Keep a source/configuration and process-manager
backup; use a shutdown grace period of at least 120 seconds. A rollback must
restore both producer and worker together. Do not restart an old worker against
reference-only jobs; recover these using their authoritative database records.

The worker loads the persisted question, validates its queue job ID, ownership
and status, and executes it through the same SQL policy as the API. An operator
review batch must have its persisted batch ID and review flag. Failed tasks
become failed BullMQ jobs with a generic error; private results remain in the
database. Logs retain task IDs and outcomes, not SQL, titles or driver errors.
Completed queue records expire after one day (maximum 1,000), failures after
seven days (maximum 1,000); BullMQ applies these limits as jobs finish.
Default concurrency is four high/two low, bounded at 20/10 respectively by
`EXPLORER_HIGH_QUEUE_CONCURRENT` and `EXPLORER_LOW_QUEUE_CONCURRENT`.
`EXPLORER_QUERY_SQL_TIMEOUT` defaults to 30,000 ms and cannot exceed 60,000 ms.
