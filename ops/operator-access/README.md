# Operational API endpoints

Add operational API routes inside the `registerOperatorRoutes` scope in
`packages/api-server/src/operations.ts`. That scope applies operator
authentication, operator route metadata and non-cacheable responses to every
route and nested plugin. It does not infer privileges from a URL spelling.

The public quota recognizes this metadata but independently verifies the
operator token before exempting a request. An unauthenticated caller cannot
consume operational results or bypass the public quota by naming a new path.
Successful authentication supplies the grant holder and credential fingerprint to the
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

The API, worker and prefetch processes read their own `OPERATIONS_GRANTS`.
Pipeline reads `PIPELINE_OPERATOR_GRANTS`. Set these variables to JSON arrays.
Each entry has a holder (a service or individual identifier), one scope, the lowercase
SHA-256 digest of a secret bearer token and an absolute UTC expiration. Supply only
the grants needed by that process. Generate a separate high-entropy bearer token
of at least 32 random bytes for each holder, service and capability. The caller
keeps the token in its secret store and sends it over HTTPS. The server needs its
digest. For example, the following shows the configuration shape with placeholders:

```json
[{"holder":"monitoring","scope":"metrics:read","sha256":"<64 lowercase hex digits>","expiresAt":"<UTC timestamp>"}]
```

| Capability | Consumers |
| --- | --- |
| `metrics:read` | API, worker or prefetch metrics scraper |
| `schema:read` | API client reading the private schema at `/docs/json` |
| `pipeline:backfill` | Pipeline client submitting a warehouse backfill |

A configured policy is authoritative. Malformed entries or duplicate digests
disable access. Each process reads its policy at startup and checks expiration
on each request. Overlap independently expiring grants for the same holder during
rotation. Removing a grant and restarting the process revokes it immediately.

**Migration.** Provision grants and the corresponding client secrets before deploying.
Without a grants policy the former API, worker and prefetch tokens authorize only
metrics. Their existing current/previous rotation and 24-hour maximum overlap still
apply. Schema access and pipeline backfills require their named grants. The old
`PIPELINE_OPERATOR_TOKEN` alone cannot start work. Keep host clocks synchronized.

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
3. Publish the new grant and give the previous one a short absolute deadline. Replace
   runtime files atomically and restart each service with its new environment.
   Drain API upstreams one at a time; pause and drain worker queues and restore
   their prior paused states; wait until prefetch is idle and pipeline has no
   active jobs. Preserve current production job/configuration paths.
4. Verify both values work only for their intended service. Update consumer
   files atomically, keeping their current owner and restrictive mode. Reload
   Prometheus and wait for fresh successful scrapes. Check API health, public
   behavior, pipeline health and worker readiness as applicable.
5. Remove the previous grant from the environment and PM2 configuration, then
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
