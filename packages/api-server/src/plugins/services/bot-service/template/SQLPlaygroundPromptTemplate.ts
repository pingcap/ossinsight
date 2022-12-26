import {RelationInfo, SQLExample, SQLGeneratePromptTemplate} from "./GenerateSQLPromptTemplate";

export class SQLPlaygroundPromptTemplate extends SQLGeneratePromptTemplate {
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 100;
  public temperature: number = 0.3;
  public topP: number = 0.4;
  public resultPrefix: string = 'SELECT ';

  public tables = [
    {
      name: 'github_events',
      columns: [
        {
          name: 'type',
          enums: ['PullRequestEvent', 'PushEvent', 'IssueCommentEvent', 'IssuesEvent', 'PullRequestReviewCommentEvent', 'WatchEvent', 'CreateEvent', 'DeleteEvent', 'ForkEvent', 'ReleaseEvent']
        },
        { name: 'created_at' },
        { name: 'repo_id' },
        { name: 'repo_name' },
        { name: 'actor_id' },
        { name: 'actor_login' },
        { name: 'language' },
        { name: 'additions' },
        { name: 'deletions' },
        { name: 'action' },
        { name: 'number' },
        { name: 'org_login' },
        { name: 'org_id' },
        { name: 'state' },
        { name: 'closed_at' },
        { name: 'comments' },
        { name: 'pr_merged_at' },
        { name: 'pr_merged' },
        { name: 'pr_changed_files' },
        { name: 'pr_review_comments' },
        { name: 'pr_or_issue_id' },
        { name: 'push_size' },
        { name: 'push_distinct_size' },
        { name: 'creator_user_login' },
        { name: 'creator_user_id' },
        { name: 'pr_or_issue_created_at' }
      ]
    },
    {
      name: 'github_repos',
      columns: [
        { name: 'repo_id' },
        { name: 'repo_name' },
        { name: 'owner_id' },
        { name: 'owner_login' },
        { name: 'owner_is_org' },
        { name: 'description' },
        { name: 'primary_language' },
        { name: 'license' },
        { name: 'size' },
        { name: 'stars' },
        { name: 'forks' },
        { name: 'parent_repo_id' },
        { name: 'is_fork' },
        { name: 'is_archived' },
        { name: 'is_deleted' },
        { name: 'latest_released_at' },
        { name: 'pushed_at' },
        { name: 'created_at' },
        { name: 'updated_at' }
      ]
    },
  ];

  public relations: RelationInfo[] = [
    {
      leftTableName: 'github_events',
      leftColumnName: 'repo_id',
      rightTableName: 'github_repos',
      rightColumnName: 'repo_id'
    }
  ];

  public examples: SQLExample[] = [
    {
      question: 'How many contributors in @pingcap/tidb',
      sql: `
        SELECT COUNT(DISTINCT creator_user_login) AS contributors
        FROM github_events
        WHERE repo_name = 'pingcap/tidb'
          AND type = 'PullRequestEvent'
          AND action = 'closed'
          AND pr_merged = true
      `
    },
    {
      question: 'Who am I',
      sql: `
        SELECT {{my_user_login}} AS user_login;
      `
    },
    {
      question: 'Am I a contributor to this repo',
      sql: `
        SELECT CASE sub.prs > 0 WHEN TRUE THEN 'Yes' ELSE 'No' END AS is_contributor
        FROM (
            SELECT COUNT(*) AS prs
            FROM github_events
            WHERE
                type = 'PullRequestEvent'
                AND action = 'opened'
                AND repo_id = {{this_repo_id}}
                AND actor_login = {{my_user_login}}
        ) AS sub;
      `
    }
  ];

}