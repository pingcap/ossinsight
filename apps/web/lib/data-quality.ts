/**
 * Star/PR/issue metrics on OSSInsight are derived from GitHub's global public
 * events firehose (`https://api.github.com/events`), which the ETL ingests in
 * `etl/config/initializers/fetch_event.rb`.
 *
 * GitHub has progressively stopped emitting most non-Push event types through
 * that firehose. Measured 2026-08-19 against GH Archive hourly dumps (50k
 * events/month, same hour of day):
 *
 *   2025-06  Push 59.1%  Watch 2.96%  PR 7.95%
 *   2026-04  Push 73.1%  Watch 2.20%  PR 5.74%
 *   2026-06  Push 87.2%  Watch 0.05%  PR 0.26%
 *   2026-08  Push 95.4%  Watch 0.22%  PR 0.96%
 *
 * A live sample of 500 events from the firehose returned zero WatchEvent and
 * zero IssuesEvent. GH Archive and its mirrors (BigQuery, ClickHouse,
 * ecosyste.ms, OpenDigger) are fed by the same firehose, so they are equally
 * affected. Repo-scoped `/repos/{owner}/{repo}/events` still returns a full
 * event mix, and GraphQL `stargazerCount` still works.
 *
 * Consequence: any ranking derived from WatchEvent rows is meaningless. The
 * `past_24_hours` trending leaderboard had a top repo with 12 stars and a
 * median of 1 star.
 *
 * This is an explicit incident switch, deliberately not an automatic
 * threshold: WatchEvent volume is already near zero, so using the degraded
 * data to decide whether the data is degraded would be circular.
 *
 * Flip `active` to false once rankings are driven by `stargazerCount`
 * snapshot deltas instead of WatchEvent rows.
 */
export const STAR_DATA_INCIDENT = {
  active: true,

  /** First measurable drop in firehose completeness (gharchive.org#310). */
  suspectSince: '2025-05-23',

  /** Collapse to near-zero non-Push events (gharchive.org#320). */
  severelyDegradedSince: '2026-05-01',

  headline: 'Star-based rankings are temporarily unavailable',

  body:
    "GitHub's public events firehose stopped emitting most star, pull request " +
    'and issue events, so our star-based rankings would be badly misleading. ' +
    "We've turned them off rather than publish numbers we know are wrong. " +
    'Repository activity and totals sourced directly from GitHub are unaffected.',

  /** Machine-readable marker for API consumers. */
  marker: {
    status: 'degraded' as const,
    metric: 'watch_event_derived',
    source: 'github_public_events_firehose',
    suspect_since: '2025-05-23',
    severely_degraded_since: '2026-05-01',
    note: 'Event-derived star/PR/issue counts are lower bounds, not exact values.',
  },
} as const;

/** True when a WatchEvent-derived ranking must not be rendered. */
export function isStarRankingDegraded(): boolean {
  return STAR_DATA_INCIDENT.active;
}
