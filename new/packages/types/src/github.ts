/** GitHub event types */
export type GitHubEventType =
  | 'WatchEvent'
  | 'PushEvent'
  | 'PullRequestEvent'
  | 'IssuesEvent'
  | 'ForkEvent'
  | 'IssueCommentEvent'
  | 'PullRequestReviewEvent'
  | 'PullRequestReviewCommentEvent'
  | 'CreateEvent'
  | 'DeleteEvent'
  | 'ReleaseEvent'
  | 'CommitCommentEvent'
  | 'GollumEvent'
  | 'MemberEvent'
  | 'PublicEvent';

/** GitHub event record */
export interface GitHubEvent {
  id: number;
  type: GitHubEventType;
  created_at: Date;
  repo_id: number;
  repo_name: string;
  actor_id: number;
  actor_login: string;
  language?: string;
  additions?: number;
  deletions?: number;
  action?: string;
  number?: number;
  commit_id?: string;
  comment_id?: number;
  org_login?: string;
  org_id?: number;
  state?: string;
  closed_at?: Date;
  pr_merged_at?: Date;
  pr_merged?: boolean;
  pr_changed_files?: number;
  pr_review_comments?: number;
  pr_or_issue_id?: number;
  push_size?: number;
  push_distinct_size?: number;
  creator_user_login?: string;
  creator_user_id?: number;
  event_day?: Date;
  event_month?: Date;
  event_year?: number;
}

/** GitHub repository */
export interface GitHubRepo {
  repo_id: number;
  repo_name: string;
  owner_id?: number;
  owner_login?: string;
  owner_is_org?: boolean;
  description?: string;
  primary_language?: string;
  license?: string;
  size?: number;
  stars?: number;
  forks?: number;
  parent_repo_id?: number;
  is_fork?: boolean;
  is_archived?: boolean;
  is_deleted?: boolean;
  latest_released_at?: Date;
  pushed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

/** GitHub user */
export interface GitHubUser {
  id: number;
  login: string;
  type?: 'User' | 'Organization' | 'Bot';
  name?: string;
  email?: string;
  organization?: string;
  address?: string;
  country_code?: string;
  region_code?: string;
  state?: string;
  city?: string;
  longitude?: number;
  latitude?: number;
  public_repos?: number;
  followers?: number;
  following?: number;
  is_bot?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
