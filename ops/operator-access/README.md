# Operational API endpoints

Add operational API routes inside the `registerOperatorRoutes` scope in
`packages/api-server/src/operations.ts`. That scope applies operator
authentication, operator route metadata and non-cacheable responses to every
route and nested plugin. It does not infer privileges from a URL spelling.

The public quota recognizes this metadata but independently verifies the
operator token before exempting a request. An unauthenticated caller cannot
consume operational results or bypass the public quota by naming a new path.
Successful authentication supplies the existing operator fingerprint to the
request audit log. Missing operator configuration fails closed with 503.

Prometheus instrumentation remains registered in the parent application so it
still measures public routes. The protected `/metrics` endpoint reads the same
configured default registry, including application counters. `/docs/json` keeps
its existing URL and includes product routes. The boolean `/healthy` response
remains public and subject to the public quota.

The unused `ADMIN_EMAIL` and `PLAYGROUND_TRUSTED_GITHUB_LOGINS` configuration
fields have been removed. They never granted access. Existing product-level
JWT and `explorer_trusted_users` checks remain authoritative; this change adds
no user roles or privileges. Old environment files may drop the unused keys on
their next normal update.

## Credentials and rotation

API, prefetch and worker processes each read their own `OPERATIONS_TOKEN`.
Pipeline reads `PIPELINE_OPERATOR_TOKEN`. These variable names are a schema,
not a reason to share the values. Generate a separate random secret of at least
32 bytes for each service/instance. API `/metrics` and `/docs/json`, prefetch
metrics and worker metrics are read-only; pipeline credentials can trigger
work and must never be distributed to a monitoring-only client.

The existing single-token configuration remains supported. For a planned
rotation, configure the new value as the current token, and optionally set:

| Process | Previous value | Absolute deadline |
| --- | --- | --- |
| API / prefetch / worker | `OPERATIONS_TOKEN_PREVIOUS` | `OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT` |
| Pipeline | `PIPELINE_OPERATOR_TOKEN_PREVIOUS` | `PIPELINE_OPERATOR_TOKEN_PREVIOUS_EXPIRES_AT` |

The deadline must be canonical UTC (`YYYY-MM-DDTHH:mm:ssZ` or with exactly
three fractional digits), at most 24 hours after process startup. Prefer a
short window sized for the rollout. Both values must be distinct, at least
32 bytes, no more than 256 characters, and contain no whitespace/control
characters. Missing, malformed or overly long overlap settings fail closed
with 503. An already-expired previous slot is valid configuration but cannot
authenticate; the current token continues to work. Authentication compares
fixed-size hashes in constant time and identifies only the matching key's
short fingerprint in existing request audit records.

Each process captures the configuration once at startup and checks the old
deadline on every request. Expiry requires no restart; restarting with the
same absolute deadline cannot renew it. Once the running process observes
expiry, a backward clock adjustment cannot revive the old value. Removing
the previous slot and restarting revokes it immediately. Keep host time
synchronized; expiration depends on the host clock.

### Planned change

1. Inventory every consumer, including Prometheus `bearer_token_file` paths,
   private operational scripts and incident-response users. Record the
   service, purpose, owner, creation/rotation date and fingerprint, never the
   value. Review this inventory at least quarterly and rotate each token at
   least every 90 days, or sooner on exposure or operator offboarding.
2. Generate each new value on the service host or in the existing approved
   secret store. Keep runtime files and PM2 state restricted to the service
   owner (0600 files / 0700 private directories), outside Git and artifacts.
   Do not place values in shell arguments, CI logs, tickets or this document.
   Use existing secret-management infrastructure when available; a new
   service and new cloud permissions are not prerequisites for this change.
3. Set new/current plus old/previous with a short absolute deadline. Replace
   runtime files atomically and restart each service with its new environment.
   Drain API upstreams one at a time; pause and drain worker queues and restore
   their prior paused states; wait until prefetch is idle and pipeline has no
   active jobs. Preserve current production job/configuration paths.
4. Verify both values work only for their intended service. Update consumer
   files atomically, keeping their current owner and restrictive mode. Reload
   Prometheus and wait for fresh successful scrapes. Check API health, public
   behavior, pipeline health and worker readiness as applicable.
5. Remove the previous slot from the environment and PM2 configuration, then
   restart using the same controlled procedure. Verify old=401, new=200,
   anonymous=401 and cross-service tokens=401. Confirm fresh monitoring data
   and restore all upstreams/queue states. Record fingerprints, timestamps,
   results and the next rotation due date in the private operations ledger.

Keep a restricted rollback record during the rollout. Before consumer switch,
rollback can restore the previous process and credential. After the switch,
rollback must retain the new credential or restore the matching consumer too.
Never roll back by re-enabling a compromised credential. Retired release
copies/backups are not valid credentials after all services reject the old
value; do not turn them back into live configuration during a later rollback.

### Suspected compromise

Do not use an overlap for a known exposed token. Replace it, remove all old
slots, restart affected services and update consumers through trusted access.
Verify rejection on every service that previously shared it, even if this
temporarily interrupts monitoring. Review credential fingerprints in existing
audit records and investigate the affected time window; authentication logs
must never contain bearer values. This procedure rotates operator tokens only,
not database accounts, GitHub tokens, user JWTs or export/share links.

The code supports safe rotation but does not claim that repository merge alone
changes live credentials or provisions a secret manager. Production rotation
must have a separate verified deployment record.
