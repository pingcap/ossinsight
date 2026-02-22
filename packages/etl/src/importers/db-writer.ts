import mysql2 from "mysql2/promise";
import type { GithubEventRecord } from "../models/github-event.js";
import { logger } from "../utils/logger.js";

const BATCH_SIZE = 1000;

/**
 * Bulk-insert a batch of GH Archive records into `github_events`.
 * Uses raw MySQL2 for maximum throughput (avoids Prisma overhead for batch writes).
 * Skips duplicates (INSERT IGNORE) to make re-runs idempotent.
 */
export async function bulkInsertEvents(
  pool: mysql2.Pool,
  events: GithubEventRecord[]
): Promise<number> {
  if (events.length === 0) return 0;

  let inserted = 0;

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    const placeholders = batch.map(() => "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").join(",");

    const values = batch.flatMap((e) => [
      e.id,
      e.type,
      e.created_at,
      e.repo_id,
      e.repo_name,
      e.actor_id,
      e.actor_login,
      e.language,
      e.additions,
      e.deletions,
      e.action,
      e.number,
      e.commit_id,
      e.comment_id,
      e.org_login,
      e.org_id,
      e.state,
      e.closed_at,
      e.comments,
      e.pr_merged_at,
      e.pr_merged ? 1 : 0,
      e.pr_changed_files,
      e.pr_review_comments,
      e.pr_or_issue_id,
      e.event_day,
      e.event_month,
      e.event_year,
      e.push_size,
      e.push_distinct_size,
      e.creator_user_login,
      e.creator_user_id,
    ]);

    const sql = `
      INSERT IGNORE INTO github_events (
        id, type, created_at, repo_id, repo_name, actor_id, actor_login,
        language, additions, deletions, action, number, commit_id,
        comment_id, org_login, org_id, state, closed_at, comments,
        pr_merged_at, pr_merged, pr_changed_files, pr_review_comments,
        pr_or_issue_id, event_day, event_month, event_year,
        push_size, push_distinct_size, creator_user_login, creator_user_id
      ) VALUES ${placeholders}
    `;

    const [result] = await pool.query<mysql2.ResultSetHeader>(sql, values);
    inserted += result.affectedRows;
    logger.debug({ batch: i / BATCH_SIZE + 1, affectedRows: result.affectedRows }, "Batch inserted");
  }

  return inserted;
}

/** Delete all events in a given hour window (to allow idempotent re-import). */
export async function deleteEventsInWindow(
  pool: mysql2.Pool,
  windowStart: Date,
  windowEnd: Date
): Promise<number> {
  let deleted = 0;
  while (true) {
    const [result] = await pool.query<mysql2.ResultSetHeader>(
      `DELETE FROM github_events WHERE created_at BETWEEN ? AND ? LIMIT 10000`,
      [windowStart, windowEnd]
    );
    deleted += result.affectedRows;
    if (result.affectedRows < 10000) break;
  }
  logger.debug({ windowStart, windowEnd, deleted }, "Deleted events in window");
  return deleted;
}
