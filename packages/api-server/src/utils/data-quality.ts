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
const STAR_INCIDENT_CONFIG_PATH = path.join(
  __dirname, '..', '..', '..', '..', 'configs', 'data-quality', 'star-incident-queries.json'
);

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
    // Without the list we cannot know which queries to gate; serve everything
    // rather than blocking the whole API, but make the misconfiguration loud.
    console.error(
      `[data-quality] Failed to load ${STAR_INCIDENT_CONFIG_PATH}; the star-data incident gate is DISABLED.`,
      err
    );
    return { active: false, blocked: [], tainted: [] };
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
