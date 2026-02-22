/** Raw GH Archive event as returned by the JSON file. */
export interface RawGHEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    id: number;
    name: string;
  };
  actor: {
    id: number;
    login: string;
  };
  org?: {
    id: number;
    login: string;
  };
  payload: Record<string, unknown>;
}

/** Normalised record ready for bulk insertion into `github_events`. */
export interface GithubEventRecord {
  id: number;
  type: string;
  created_at: Date;
  repo_id: number;
  repo_name: string;
  actor_id: number;
  actor_login: string;
  language: string;
  additions: number;
  deletions: number;
  action: string;
  number: number;
  commit_id: string;
  comment_id: number;
  org_login: string;
  org_id: number;
  state: string;
  closed_at: Date;
  comments: number;
  pr_merged_at: Date;
  pr_merged: boolean;
  pr_changed_files: number;
  pr_review_comments: number;
  pr_or_issue_id: number;
  event_day: string;   // "YYYY-MM-DD"
  event_month: string; // "YYYY-MM-01"
  event_year: number;
  push_size: number;
  push_distinct_size: number;
  creator_user_login: string;
  creator_user_id: number;
  pr_or_issue_created_at: Date;
}
