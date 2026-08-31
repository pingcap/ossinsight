import STAR_INCIDENT_QUERY_LISTS from '../../../configs/data-quality/star-incident-queries.json';

/**
 * Star/PR/issue metrics on OSSInsight come from GitHub's public events
 * firehose (`https://api.github.com/events`), ingested by the ETL in
 * `etl/` (GH Archive hourly bulk import plus a live /events poller).
 *
 * THREE measured GitHub-side changes degraded that data. All dates below were
 * measured against GH Archive hourly files and the production database, not
 * inferred:
 *
 * 1. Volume cut (2025-05-24). Every event type dropped ~32% overnight with
 *    the event MIX PRESERVED - fewer events, same proportions. This alone did
 *    not distort rankings.
 *
 * 2. Payload trimming (2025-10-09, day-exact and atomic). PR
 *    `additions`/`deletions`/`changed_files`, push `size`/`distinct_size`,
 *    `pr_merged` and `pr_merged_at` now arrive as 0 or the 1970 epoch
 *    sentinel. Measured: 2025-10-08 = 96.2% of PRs carried `additions`,
 *    2025-10-09 = 0%. In this era 0 means UNKNOWN, not zero. Fixing
 *    pagination does NOT restore these fields; they need per-object refetch
 *    (GraphQL `pullRequests` returns them at ~100 PRs per rate-limit point).
 *
 * 3. Mix collapse (2026-03 through 2026-07, progressive). The feed is
 *    partitioned by POSITION: offsets 1-100 are a ~97% PushEvent block and
 *    the healthy mix only appears at offsets 101-300, hard-capped at 300
 *    items total (`per_page` is clamped to 100). Our ETL read only offsets
 *    1-100, so WatchEvent/month fell 2,223,459 (2026-02) -> 69,004
 *    (2026-08). GitHub did not delete the data; it moved it past the offset
 *    our pipeline read. GH Archive and its mirrors read the feed the same
 *    way, so the missing events reached no public archive either.
 *
 * Consequence, by tier:
 * - History through 2025-05-23 is intact and trustworthy (59.74% of the
 *   database).
 * - Rankings whose ORDER depends on recent star events are noise and are
 *   served as an explicit `unavailable` envelope, never as numbers.
 * - Other event-derived counts still run but are LOWER BOUNDS, and their
 *   responses carry a `degraded` marker.
 *
 * Not affected: `github_repos.stars` and other totals synced directly from
 * GitHub via `packages/sync-github-data`, and history before the dates above.
 *
 * This is an explicit incident switch, deliberately not an automatic
 * threshold: WatchEvent volume in our DB is near zero, so using the degraded
 * data to decide whether the data is degraded would be circular. The switch
 * lives in `configs/data-quality/star-incident-queries.json` (shared with
 * packages/api-server and the public /v1 proxy); flip `active` there to false
 * once the ETL reads offsets 1-300 and the affected windows are
 * re-materialized, or rankings are driven by `stargazerCount` snapshot deltas.
 */
export const STAR_DATA_INCIDENT = {
  active: STAR_INCIDENT_QUERY_LISTS.active,

  /** Uniform ~32% volume cut across all event types; mix preserved. */
  suspectSince: '2025-05-24',

  /** Payload trimming: PR/push size fields arrive as 0 = unknown (day-exact). */
  payloadTrimmedSince: '2025-10-09',

  /** Progressive collapse of the event mix from the position-partitioned feed. */
  severelyDegradedSince: '2026-03-01',

  headline: 'Star-based rankings are paused',

  body:
    'GitHub changed how its public events feed is paginated, and our ingestion ' +
    'read only the first slice, so star, pull request and issue events since ' +
    'mid-2025 were badly under-captured. Rankings that depend on those counts ' +
    'would be misleading, so we pause them instead of publishing numbers we ' +
    'know are wrong. History before May 2025, repository totals synced ' +
    'directly from GitHub, and commit activity are unaffected.',

  /**
   * Machine-readable envelope for API/MCP consumers.
   *
   * `unavailable` is returned with HTTP 200 and an empty result set: the
   * metric cannot be computed right now, and an empty list here means
   * "we cannot answer", NOT "there are no results". `degraded` accompanies
   * real rows that are lower bounds.
   */
  marker: {
    status: 'degraded' as const,
    metric: 'github_event_derived',
    source: 'github_public_events_firehose',
    volume_cut_since: '2025-05-24',
    payload_trimmed_since: '2025-10-09',
    severely_degraded_since: '2026-03-01',
    note:
      'Event-derived counts are LOWER BOUNDS. GitHub position-partitioned the /events feed ' +
      '(offsets 1-100 are ~97% PushEvent; the healthy mix starts at offset 101) and our ETL read ' +
      'only the first slice, so star/PR/issue capture collapsed through 2026-03..2026-07. ' +
      'Separately, since 2025-10-09 GitHub trims payload fields: PR additions/deletions and push ' +
      'commit counts arrive as 0, which means unknown, not zero. History before 2025-05-24 is intact.',
    docs: 'https://ossinsight.io/docs/data-quality',
  },

  /** Envelope for a blocked ranking: HTTP 200, empty rows, explicit reason. */
  unavailableMarker: {
    status: 'unavailable' as const,
    metric: 'github_event_derived_ranking',
    source: 'github_public_events_firehose',
    unavailable_since: '2026-03-01',
    reason:
      'This ranking is ordered by recent star/PR/issue event counts, and our capture of those ' +
      'events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result ' +
      'here means the metric cannot be computed, not that there are no matching repositories.',
    alternative:
      'Current totals synced directly from GitHub remain accurate: use /v1/repos/{owner}/{repo} ' +
      'for star and fork counts, or /v1/collections/{id} for collection membership.',
    docs: 'https://ossinsight.io/docs/data-quality',
  },
} as const;

export type DataQualityMarker = typeof STAR_DATA_INCIDENT.marker;
export type DataQualityUnavailableMarker = typeof STAR_DATA_INCIDENT.unavailableMarker;

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
