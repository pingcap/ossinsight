# Request statistics and collection activity

`stats_api_requests` is a usage-statistics table. New records keep the final
method, registered resource shape, outcome, duration and development flag.
Resource segments and query parameters use the reviewed `requestAuditContext`
allowlist in `@ossinsight/types`; arbitrary query values, request bodies and
unknown paths are not stored. The legacy `client_ip` and `client_origin` columns
remain compatible with the existing schema but receive empty strings.

Operational `api_request` security events remain separate, with request IDs,
authenticated actors, outcomes and the source IP established by the configured
proxy trust chain. This change does not remove or alter those events.

## Collection activity

`calc_collection_visits` counts successful (2xx), non-error, production GET
requests to collection queries over the past month. It accepts canonical
positive collection IDs without numeric coercion and resets collections with
no qualifying requests to zero. Both legacy string IDs and new numeric JSON
IDs work. Prefetch executes queries directly and does not generate HTTP request
statistics.

The existing `past_month_visits` field is a request-activity signal, not unique
visitors or page views. A page can make several requests. Successful automated
requests can still contribute; the public request quota remains necessary but
does not establish that a visitor is human. Do not present this count as a
verified popularity or anti-fraud metric.

## Rollout and historical data

Deploy the API recorder and the pipeline configuration together. Verify recent
new-row metadata without exporting request contents, then run the normal
collection task and confirm completion. The recorder requires no schema or
permission change. The aggregation intentionally corrects existing stale
counts and can be rerun safely.

This change only minimizes **future writes**. Existing rows may contain raw
visitor identifiers and sensitive parameters. Before deleting or rewriting
them, inventory external reporting consumers, incident-investigation needs,
database/back-up access and retention obligations. Record an approved retention
period and verify recovery before applying a bounded historical cleanup. Keep
this follow-up open until the database and relevant backups have been checked;
do not report that the historical-data risk is fixed by this code change.

See [access and historical cleanup](access-and-retention.md) for the tested
writer privilege boundary, deployment procedure and historical-data decision.
