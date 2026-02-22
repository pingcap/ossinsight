import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import type { RawGHEvent, GithubEventRecord } from "../models/github-event.js";
import { fetchGHArchiveStream } from "../utils/downloader.js";
import { logger } from "../utils/logger.js";

const EPOCH = new Date("1970-01-01T00:00:00Z");

/**
 * Parse a single raw GH Archive JSON event into a flat `github_events` row.
 * Mirrors the logic from the legacy Ruby `Importer#parse!` method.
 */
export function parseEvent(raw: RawGHEvent): GithubEventRecord {
  const p = raw.payload as Record<string, any>;
  const pr = p?.pull_request as Record<string, any> | undefined;
  const issue = p?.issue as Record<string, any> | undefined;
  const comment = p?.comment as Record<string, any> | undefined;
  const review = p?.review as Record<string, any> | undefined;

  const createdAt = new Date(raw.created_at);
  const dateStr = raw.created_at.slice(0, 10); // "YYYY-MM-DD"
  const yearMonthStr = raw.created_at.slice(0, 7) + "-01"; // "YYYY-MM-01"
  const year = parseInt(raw.created_at.slice(0, 4), 10);

  return {
    id: parseInt(raw.id, 10),
    type: raw.type ?? "",
    created_at: createdAt,
    repo_id: raw.repo?.id ?? 0,
    repo_name: raw.repo?.name ?? "",
    actor_id: raw.actor?.id ?? 0,
    actor_login: raw.actor?.login ?? "",
    language: pr?.base?.repo?.language ?? "",
    additions: pr?.additions ?? 0,
    deletions: pr?.deletions ?? 0,
    action: p?.action ?? "",
    number:
      issue?.number ?? pr?.number ?? (p?.number as number | undefined) ?? 0,
    commit_id: comment?.commit_id ?? "",
    comment_id: comment?.id ?? 0,
    org_login: raw.org?.login ?? "",
    org_id: raw.org?.id ?? 0,
    state: pr?.state ?? issue?.state ?? "",
    closed_at: parseDate(pr?.closed_at ?? issue?.closed_at),
    comments: pr?.comments ?? issue?.comments ?? 0,
    pr_merged_at: parseDate(pr?.merged_at),
    pr_merged: pr?.merged ?? false,
    pr_changed_files: pr?.changed_files ?? 0,
    pr_review_comments: pr?.review_comments ?? 0,
    pr_or_issue_id: pr?.id ?? issue?.id ?? 0,
    event_day: dateStr,
    event_month: yearMonthStr,
    event_year: year,
    push_size: (p?.size as number | undefined) ?? 0,
    push_distinct_size: (p?.distinct_size as number | undefined) ?? 0,
    creator_user_login:
      comment?.user?.login ??
      review?.user?.login ??
      issue?.user?.login ??
      pr?.user?.login ??
      "",
    creator_user_id:
      comment?.user?.id ??
      review?.user?.id ??
      issue?.user?.id ??
      pr?.user?.id ??
      0,
    pr_or_issue_created_at: parseDate(
      issue?.created_at ?? pr?.created_at
    ),
  };
}

function parseDate(value: unknown): Date {
  if (!value || typeof value !== "string") return EPOCH;
  const d = new Date(value);
  return isNaN(d.getTime()) ? EPOCH : d;
}

// ---------------------------------------------------------------------------
// Stream-based parsing
// ---------------------------------------------------------------------------

/**
 * Stream-parse a GH Archive `.json.gz` file from a given filename
 * (e.g. "2024-01-01-0.json.gz") and call `onEvent` for each parsed record.
 */
export async function streamImportFile(
  filename: string,
  onEvent: (record: GithubEventRecord) => void | Promise<void>
): Promise<number> {
  logger.info({ filename }, "Downloading GH Archive file");
  const stream: Readable = await fetchGHArchiveStream(filename);

  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  let count = 0;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const raw: RawGHEvent = JSON.parse(trimmed);
      await onEvent(parseEvent(raw));
      count++;
    } catch (err) {
      logger.warn({ err, line: trimmed.slice(0, 80) }, "Failed to parse line");
    }
  }

  logger.info({ filename, count }, "Finished parsing GH Archive file");
  return count;
}
