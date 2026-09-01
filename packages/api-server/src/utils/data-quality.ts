import fs from "fs";
import path from "path";

/**
 * Star-data incident gate, mirroring `apps/web/lib/data-quality.ts`.
 *
 * Two independent GitHub-side changes degraded event-derived metrics:
 * (1) since ~2025-05-23 the public /events firehose is partitioned by
 * position — the first page is a ~97% PushEvent block and the healthy event
 * mix only appears at offsets 101-300 — while our ETL polled only page 1, so
 * star/PR/issue events were barely captured; (2) since ~2025-11 GitHub trims
 * payload fields, so PR additions/deletions and push commit counts arrive as
 * 0 (unknown, not zero).
 *
 * The switch and the blocked/tainted query lists live in
 * `configs/data-quality/star-incident-queries.json`, shared with the web app.
 */

export type QueryDataQuality = 'blocked' | 'tainted' | 'ok';

interface StarIncidentQueryLists {
  active: boolean;
  blocked: string[];
  tainted: string[];
}

/** Machine-readable marker attached to degraded responses (kept in sync with apps/web/lib/data-quality.ts). */
export const STAR_DATA_INCIDENT_MARKER = {
  status: 'degraded',
  metric: 'github_event_derived',
  source: 'github_public_events_firehose',
  suspect_since: '2025-05-23',
  severely_degraded_since: '2026-05-01',
  note:
    'GitHub position-partitioned the /events firehose (~2025-05-23) and our ETL read only the ' +
    'near-Push-only first page, so event-derived star/PR/issue counts are lower bounds, not exact ' +
    'values. Additionally, since ~2025-11 GitHub trims payload fields: PR additions/deletions and ' +
    'push commit counts arrive as 0, meaning unknown.',
} as const;

// Resolved relative to this file, both from src/ (ts-jest) and dist/ (build):
// utils -> {src,dist} -> api-server -> packages -> repo root.
const CONFIGS_ROOT = process.env.CONFIGS_PATH
  || path.join(__dirname, '..', '..', '..', '..', 'configs');
const STAR_INCIDENT_CONFIG_PATH = path.join(
  CONFIGS_ROOT, 'data-quality', 'star-incident-queries.json'
);

/**
 * Last-resort blocked list used when the shared config cannot be read.
 * Keep in sync with the `blocked` array in star-incident-queries.json.
 */
const FALLBACK_BLOCKED = [
  'trending-repos',
  'recent-hot-collections',
  'collection-stars-last-28-days-rank',
  'collection-stars-month-rank',
  'collection-stars-history-rank',
  'orgs/stars/top-repos',
  'orgs/stars/locations',
  'orgs/stars/organizations',
  'orgs/commits/code-changes/top-repos',
  'live-time-top-developers-by-prs-daily',
  'live-time-top-repos-by-prs-daily',
  'analyze-recent-commits',
] as const;

function loadStarIncidentQueryLists(): StarIncidentQueryLists {
  try {
    const raw = fs.readFileSync(STAR_INCIDENT_CONFIG_PATH, { encoding: 'utf-8' });
    const parsed = JSON.parse(raw) as StarIncidentQueryLists;
    return {
      active: parsed.active === true,
      blocked: Array.isArray(parsed.blocked) ? parsed.blocked : [],
      tainted: Array.isArray(parsed.tainted) ? parsed.tainted : [],
    };
  } catch (err) {
    // FAIL CLOSED. If the list cannot be read we do not know which queries are
    // safe, and serving everything would silently republish the exact rankings
    // this gate exists to withhold. Fall back to a compiled-in blocked set so a
    // misconfigured deployment degrades loudly rather than leaking quietly.
    console.error(
      `[data-quality] Failed to load ${STAR_INCIDENT_CONFIG_PATH}; falling back to the compiled-in blocked list.`,
      err
    );
    return { active: true, blocked: [...FALLBACK_BLOCKED], tainted: [] };
  }
}

const starIncidentQueryLists = loadStarIncidentQueryLists();

const DEGRADED_BLOCKED_QUERIES: ReadonlySet<string> = new Set(starIncidentQueryLists.blocked);
const DEGRADED_TAINTED_QUERIES: ReadonlySet<string> = new Set(starIncidentQueryLists.tainted);

export function isStarDataIncidentActive(): boolean {
  return starIncidentQueryLists.active;
}

/**
 * Classify a preset query by star-incident impact. Returns 'ok' for every
 * query when the incident switch is off.
 */
export function getQueryDataQuality(queryName: string): QueryDataQuality {
  if (!starIncidentQueryLists.active) {
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


/** Envelope for a blocked public-API route: HTTP 200, empty rows, explicit reason. */
export const STAR_DATA_UNAVAILABLE_MARKER = {
  status: 'unavailable',
  metric: 'github_event_derived_ranking',
  source: 'github_public_events_firehose',
  unavailable_since: '2026-03-01',
  reason:
    'This ranking is ordered by recent star/PR/issue event counts, and our capture of those events ' +
    'fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means ' +
    'the metric cannot be computed, not that there are no matching repositories.',
  alternative:
    'Current totals synced directly from GitHub remain accurate: use /v1/repos/{owner}/{repo} for ' +
    'star and fork counts, or /v1/collections/{id} for collection membership.',
  docs: 'https://ossinsight.io/docs/data-quality',
} as const;

/**
 * Public /v1 routes proxied straight to TiDB Data Service by `proxyGet()`,
 * which never reaches QueryRunner. Keys are the pathname after the /v1 or
 * /public prefix, without a trailing slash.
 *
 * 'blocked' = the SQL orders results by star-event counts (GET-collections-hot
 * reads collection_items.last_month_rank, ranking_by_stars counts WatchEvent).
 * 'tainted' = event-derived series that are lower bounds after the 2025-10-09
 * payload trim or the 2026-03+ mix collapse.
 */
const PUBLIC_API_BLOCKED = new Set<string>([
  '/trends/repos',
  '/collections/hot',
  '/collections/ranking_by_stars',
]);

const PUBLIC_API_TAINTED = new Set<string>([
  '/repos/stargazers/history',
  '/repos/stargazers/countries',
  '/repos/stargazers/organizations',
  '/repos/commits/monthly',
  '/repos/overview',
  '/repos/pull_requests/monthly/line_of_changes',
  '/repos/pull_requests/monthly/sizes',
  '/users/commits/monthly',
  '/users/overview',
  '/users/pull_requests/monthly/line_of_changes',
  '/users/pull_requests/monthly/sizes',
  '/users/stars/monthly',
  '/collections/ranking_by_issues',
  '/collections/ranking_by_prs',
]);

/**
 * Classify a proxied public-API route. `pathname` is the Data Service target
 * path with path params already stripped (see utils/endpoint.ts).
 */
export function getPublicApiDataQuality(pathname: string): QueryDataQuality {
  if (!starIncidentQueryLists.active) {
    return 'ok';
  }
  const key = pathname.replace(/\/+$/, '');
  if (PUBLIC_API_BLOCKED.has(key)) {
    return 'blocked';
  }
  if (PUBLIC_API_TAINTED.has(key)) {
    return 'tainted';
  }
  return 'ok';
}
