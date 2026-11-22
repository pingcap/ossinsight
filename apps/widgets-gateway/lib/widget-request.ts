import type { BarText, ColorScheme } from './compose';

/** The day the live service is turned off. Shown in the notice before the shutdown. */
export const SUNSET_DATE_LABEL = 'December 4, 2026';

/**
 * Query parameters the widget service understands. Anything else is ignored by the service,
 * so it is dropped here too: otherwise every made-up parameter would create a new snapshot.
 */
const KNOWN_PARAMS = new Set([
  'repo_id', 'vs_repo_id', 'repo_ids', 'user_id', 'owner_id', 'collection_id',
  'period', 'activity', 'activity_type', 'role', 'zone', 'limit',
  'from', 'to', 'start', 'end',
  'axis_field', 'value_field', 'label_field',
  'image_size', 'color_scheme',
]);

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]{0,80}$/;
const VALUE_PATTERN = /^[A-Za-z0-9_.,:+\-/ ]{0,120}$/;
const MAX_QUERY_LENGTH = 600;

export interface WidgetRequest {
  /** Widget name as it appears in the URL, for example `analyze-repo-stars-history`. */
  name: string;
  /** Known parameters only, sorted, so equivalent URLs share one snapshot. */
  query: string;
  colorScheme: ColorScheme;
  /** Where the snapshot of this exact widget address is stored. */
  snapshotPath: string;
}

/** Parses a widget image request. Returns null when the address is not one the gateway should handle. */
export function parseWidgetRequest(vendor: string | undefined, name: string | undefined, params: URLSearchParams): WidgetRequest | null {
  if (vendor !== 'official' || !name || !NAME_PATTERN.test(name)) {
    return null;
  }

  const entries: Array<[string, string]> = [];
  for (const [key, value] of params.entries()) {
    if (!KNOWN_PARAMS.has(key)) {
      continue;
    }
    if (!VALUE_PATTERN.test(value)) {
      return null;
    }
    entries.push([key, value]);
  }
  entries.sort(([a, av], [b, bv]) => (a === b ? av.localeCompare(bv) : a.localeCompare(b)));

  const query = new URLSearchParams(entries).toString();
  if (query.length > MAX_QUERY_LENGTH) {
    return null;
  }

  return {
    name,
    query,
    colorScheme: params.get('color_scheme') === 'light' ? 'light' : 'dark',
    // The query is kept readable in the path so the list of snapshots doubles as the list of widgets in use.
    snapshotPath: `snapshots/${name}/${Buffer.from(query).toString('base64url') || '_'}.png`,
  };
}

export function noticeText(): BarText {
  return { strong: `Stops working on ${SUNSET_DATE_LABEL}`, detail: 'OSSInsight is shutting down', tone: 'warning' };
}

export function retiredSnapshotText(snapshotDate: Date | null): BarText {
  const date = snapshotDate
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(snapshotDate)
    : null;
  return {
    strong: 'OSSInsight has shut down',
    detail: date ? `Snapshot from ${date} · no longer updates` : 'Last snapshot · no longer updates',
    tone: 'plain',
  };
}

export function retiredWithoutSnapshotText(): BarText {
  return { strong: 'OSSInsight has shut down', detail: `This widget was retired on ${SUNSET_DATE_LABEL}`, tone: 'plain' };
}
