import STAR_INCIDENT_QUERY_LISTS from '../../../configs/data-quality/star-incident-queries.json';

/**
 * Star/PR/issue metrics on OSSInsight are derived from GitHub's global public
 * events firehose (`https://api.github.com/events`), which the ETL ingests in
 * `etl/config/initializers/fetch_event.rb`.
 *
 * Two independent GitHub-side changes degraded that data:
 *
 * 1. Position-partitioned firehose (~2025-05-23, gharchive.org#310): at
 *    per_page=100, offsets 1-100 (page 1) are a ~97% PushEvent block; the
 *    healthy event mix only appears at offsets 101-300 (pages 2-3), and the
 *    feed is hard-capped at 300 items. Our ETL polled only page 1, so star
 *    capture fell to ~0.6% of baseline and PR/issue/fork events collapsed
 *    with it. GitHub did not drop the data entirely — it moved it to pages
 *    our pipeline never read. GH Archive and its mirrors (BigQuery,
 *    ClickHouse, ecosyste.ms, OpenDigger) read the feed the same way, so the
 *    missing events never reached any public archive.
 *
 * 2. Payload trimming (~2025-11): GitHub trims payload fields for
 *    scalability, so PR `additions`/`deletions` and push commit counts
 *    arrive as 0. Semantically that 0 means "unknown", not zero; fixing the
 *    pagination does not restore these fields.
 *
 * Repo-scoped `/repos/{owner}/{repo}/events` still returns a full event mix,
 * and GraphQL `stargazerCount` still works, so totals synced from GitHub
 * remain accurate.
 *
 * Consequence: any ranking derived from WatchEvent rows is meaningless (the
 * `past_24_hours` trending leaderboard had a top repo with 12 stars and a
 * median of 1 star), and other event-derived counts are lower bounds.
 *
 * This is an explicit incident switch, deliberately not an automatic
 * threshold: WatchEvent volume in our DB is near zero, so using the degraded
 * data to decide whether the data is degraded would be circular. The switch
 * lives in `configs/data-quality/star-incident-queries.json` (shared with
 * packages/api-server); flip `active` there to false once the ETL reads
 * pages 1-3 and the affected windows are re-materialized, or rankings are
 * driven by `stargazerCount` snapshot deltas instead of WatchEvent rows.
 */
export const STAR_DATA_INCIDENT = {
  active: STAR_INCIDENT_QUERY_LISTS.active,

  /** Firehose became position-partitioned; our ETL kept reading only page 1 (gharchive.org#310). */
  suspectSince: '2025-05-23',

  /** Page-1 event mix collapsed to near-zero non-Push events (gharchive.org#320). */
  severelyDegradedSince: '2026-05-01',

  headline: 'Star-based rankings are temporarily unavailable',

  body:
    "GitHub restructured its public events firehose, and our ingestion pipeline " +
    'only read the section that now carries almost exclusively push events — so ' +
    'star, pull request and issue events were barely captured, and star-based ' +
    'rankings would be badly misleading. ' +
    "We've turned them off rather than publish numbers we know are wrong. " +
    'Repository activity and totals sourced directly from GitHub are unaffected.',

  /** Machine-readable marker for API consumers. */
  marker: {
    status: 'degraded' as const,
    metric: 'github_event_derived',
    source: 'github_public_events_firehose',
    suspect_since: '2025-05-23',
    severely_degraded_since: '2026-05-01',
    note:
      'GitHub position-partitioned the /events firehose (~2025-05-23) and our ETL read only the ' +
      'near-Push-only first page, so event-derived star/PR/issue counts are lower bounds, not exact ' +
      'values. Additionally, since ~2025-11 GitHub trims payload fields: PR additions/deletions and ' +
      'push commit counts arrive as 0, meaning unknown.',
  },
} as const;

export type DataQualityMarker = typeof STAR_DATA_INCIDENT.marker;

/** True when a WatchEvent-derived ranking must not be rendered. */
export function isStarRankingDegraded(): boolean {
  return STAR_DATA_INCIDENT.active;
}

/**
 * Rankings/leaderboards computed from WatchEvent rows or star-event counts.
 * While the incident is active these must not be served at all.
 */
export const DEGRADED_BLOCKED_QUERIES: ReadonlySet<string> = new Set(
  STAR_INCIDENT_QUERY_LISTS.blocked,
);

/**
 * Star/PR/issue/fork-derived series and counts from `github_events`. They
 * still run, but the numbers are lower bounds and responses carry
 * `data_quality: STAR_DATA_INCIDENT.marker`.
 */
export const DEGRADED_TAINTED_QUERIES: ReadonlySet<string> = new Set(
  STAR_INCIDENT_QUERY_LISTS.tainted,
);

export type QueryDataQuality = 'blocked' | 'tainted' | 'ok';

/**
 * Classify a query endpoint by star-incident impact. Returns 'ok' for every
 * query when the incident switch is off.
 */
export function getQueryDataQuality(queryName: string): QueryDataQuality {
  if (!STAR_DATA_INCIDENT.active) {
    return 'ok';
  }
  if (DEGRADED_BLOCKED_QUERIES.has(queryName)) {
    return 'blocked';
  }
  if (DEGRADED_TAINTED_QUERIES.has(queryName)) {
    return 'tainted';
  }
  return 'ok';
}
