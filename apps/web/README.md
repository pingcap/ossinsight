# OSSInsight web

## Public request budgets

Production deployments require `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
(the service already used for explorer quotas) before rolling out `proxy.ts`.
The Vercel integration aliases `KV_REST_API_URL` and `KV_REST_API_TOKEN` are also supported.
Named-query aliases, public APIs and dynamic analytics pages share a 600-request/hour
client budget; OpenGraph/Twitter rendering has a separate 60-request/hour budget.
The three homepage counters (`events-total`, `events-increment`, and
`events-increment-intervals`) share a separate 3600-request/hour realtime budget,
including their `/q/` aliases. This accommodates the homepage's two five-second
polls without spending its analytics budget; other named queries retain the
600-request/hour limit.
`PUBLIC_API_HOURLY_RATE_LIMIT`, `PUBLIC_IMAGE_HOURLY_RATE_LIMIT`, and
`PUBLIC_REALTIME_HOURLY_RATE_LIMIT` adjust these positive
integer limits up to 100000. Missing Redis configuration, Redis failures and SDK timeouts
return 503; exhausted budgets return 429 with `Retry-After`.

This budget also covers the database-backed homepage, trending and language pages,
`/llms-full.txt`, and `/sitemap.xml`, including RSC navigation and metadata requests.
The quota decision runs before rendering or database access: those pages also return
429/503 when the budget is exhausted/unavailable. Static assets and the separately
generated docs/blog remain accessible independently of the database quota.

## Public API origins

`CORS_ALLOWED_ORIGINS` accepts comma-separated exact HTTPS origins; the default is
`https://ossinsight.io,https://www.ossinsight.io`. Wildcards, credentials, paths,
queries and fragments are rejected before an audited API handler runs. Development
also permits explicitly configured loopback HTTP origins. Invalid configuration
returns a generic error without executing the handler.

All audited API responses, including MCP and avatars, apply this policy after the
handler returns. Only an exact match receives a read-only CORS permission; responses
always vary on Origin while preserving other Vary fields. Credentialed CORS is
disabled. Server clients without an Origin header remain supported, and public
request budgets apply independently.

## Request auditing and document security

Only Vercel's overwritten forwarding header supplies a client identity. Self-hosted
instances share one origin bucket and must size that aggregate budget for their traffic;
client-supplied forwarding headers are never trusted. Development mode skips Redis.
Repository/user image inputs are bounded and must resolve to an existing entity.
Public repository images have a one-hour CDN cache; collection images remain uncached
so changing collection visibility takes effect on the next request.

Web API handlers emit structured `web_api_request` records with a generated
`X-Request-ID`, route pattern, status, duration and Vercel's trusted source IP.
These routes are public; caller-supplied identity headers never become audit
principals. Request values and internal exception details are excluded. Collection
API responses, named queries (`/q`, `/api/q`, `/api/queries`) and their explain
variants bypass browser/CDN caching so revoked visibility is checked again.
This applies even without an explicit collection parameter: defaults and query
projections can also expose collections. The boundary overrides all three cache
headers on successes and errors. Server-side result caches remain behind the
fresh visibility check; public repository image caching is unaffected.

Web documents receive a fresh CSP nonce from Proxy. The renderer, JSON-LD and
analytics scripts use that nonce; production scripts cannot use arbitrary inline
JavaScript or eval. The root layout reads request headers, so HTML uses dynamic
rendering instead of sharing a cached nonce. Internal data caching remains
available. Docs/blog are rendered by their separate deployment with its own strict
nonce CSP. The static fallback CSP excludes `/blog` and `/docs` so it cannot overwrite that stronger forwarded policy; common security headers still apply everywhere. Docs HTML also renders dynamically,
while non-HTML exports and assets retain caching. Remote SVG image optimization is
disabled, and HTTPS responses include HSTS. Development permits eval for Next's
local debugging runtime. Verify real preview page rendering and CSP console
messages before promoting a deployment.
