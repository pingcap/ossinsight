# OSSInsight web

## Public request budgets

Production deployments require `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
(the service already used for explorer quotas) before rolling out `proxy.ts`.
The Vercel integration aliases `KV_REST_API_URL` and `KV_REST_API_TOKEN` are also supported.
Named-query aliases, public APIs and dynamic analytics pages share a 600-request/hour
client budget; OpenGraph/Twitter rendering has a separate 60-request/hour budget.
`PUBLIC_API_HOURLY_RATE_LIMIT` and `PUBLIC_IMAGE_HOURLY_RATE_LIMIT` adjust these positive
integer limits up to 100000. Missing Redis configuration, Redis failures and SDK timeouts
return 503; exhausted budgets return 429 with `Retry-After`.

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
API responses bypass browser/CDN caching so revoked visibility is checked again.
