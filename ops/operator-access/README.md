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

This scope change does not rotate tokens or change their expiration policy.
