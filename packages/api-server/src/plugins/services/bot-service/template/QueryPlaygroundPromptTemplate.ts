import {RelationInfo, SQLExample, SQLGeneratePromptTemplate, TableInfo} from "./GenerateSQLPromptTemplate";

export class QueryPlaygroundSQLPromptTemplate extends SQLGeneratePromptTemplate {
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 200;
  public temperature: number = 0.3;
  public topP: number = 0.4;
  public resultPrefix: string = '';

  public tables: TableInfo[] = [
    {
      name: 'github_events',
      columns: [
        { name: 'id' },
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
      ],
      comments: [
        `When type = 'PullRequestReviewCommentEvent', the action could be 'created'`,
        `When type = 'PullRequestEvent' or type = 'IssuesEvent', the action could be 'opened', 'closed'`,
        `When type = 'PullRequestEvent', action = 'closed' and pr_merged = 1, it means the pull request is merged, and the creator_user_id is a contributor of the repo`,
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
        {
          name: 'primary_language',
          invalid: [null, '']
        },
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
    {
      name: 'github_users',
      columns: [
        { name: 'id' },
        { name: 'login' },
        {
          name: 'type',
          enums: ['USR', 'ORG']
        },
        { name: 'is_bot' },
        { name: 'name' },
        { name: 'organization' },
        { name: 'country_code' },
        { name: 'followers' },
        { name: 'followings' },
        { name: 'created_at' },
        { name: 'updated_at' }
      ]
    },
    {
      name: 'collections',
      columns: [
        { name: 'id' },
        { name: 'name' }
      ]
    },
    {
      name: 'collection_items',
      columns: [
        { name: 'collection_id' },
        { name: 'repo_id' },
        { name: 'repo_name' }
      ]
    },
    {
      name: 'trending_repos',
      columns: [
        { name: 'repo_name' },
        { name: 'created_at' }
      ]
    },
    {
      name: 'github_repo_topics',
      columns: [
        { name: 'repo_id' },
        { name: 'topic' }
      ]
    }
  ];

  public relations: RelationInfo[] = [
    {
      leftTableName: 'collections',
      leftColumnName: 'id',
      rightTableName: 'collection_items',
      rightColumnName: 'collection_id'
    },
    {
      leftTableName: 'collection_items',
      leftColumnName: 'repo_id',
      rightTableName: 'github_repos',
      rightColumnName: 'repo_id'
    },
    {
      leftTableName: 'trending_repos',
      leftColumnName: 'repo_name',
      rightTableName: 'github_repos',
      rightColumnName: 'repo_name'
    },
    {
      leftTableName: 'github_events',
      leftColumnName: 'repo_id',
      rightTableName: 'github_repos',
      rightColumnName: 'repo_id'
    },
    {
      leftTableName: 'github_repos',
      leftColumnName: 'repo_id',
      rightTableName: 'github_repo_topics',
      rightColumnName: 'repo_id'
    },
    {
      leftTableName: 'github_events',
      leftColumnName: 'actor_id',
      rightTableName: 'github_users',
      rightColumnName: 'id'
    },
    {
      leftTableName: 'github_events',
      leftColumnName: 'creator_user_id',
      rightTableName: 'github_users',
      rightColumnName: 'id'
    },
    {
      leftTableName: 'github_repos',
      leftColumnName: 'owner_id',
      rightTableName: 'github_users',
      rightColumnName: 'id'
    }
  ];

  public examples: SQLExample[] = [
    {
      question: 'Geographic distribution of contributors to @pingcap/tidb',
      sql: `
        SELECT gu.country_code, COUNT(DISTINCT ge.actor_login) AS contributors
        FROM github_events ge 
        INNER JOIN github_users gu ON ge.actor_login = gu.login 
        WHERE
            ge.repo_name = 'pingcap/tidb'
            AND ge.type = 'PullRequestEvent'
            AND ge.action = 'opened'
            AND gu.country_code NOT IN ('', 'N/A', 'UND')
        GROUP BY gu.country_code
        ORDER BY contributors DESC;
      `
    },
    {
      question: 'The most popular repos about ChatGPT',
      sql: `
        SELECT gr.repo_name, gr.stars AS popularity
        FROM github_repos gr
        WHERE gr.description LIKE '%ChatGPT%'
        ORDER BY popularity DESC;
      `
    },
    {
      question: 'The hottest open source projects recently',
      sql: `
        SELECT *
        FROM github_repos gr
        WHERE gr.repo_name IN (SELECT repo_name FROM trending_repos tr ORDER BY created_at DESC LIMIT 20)
        ORDER BY gr.stars DESC;
      `
    },
    {
      question: '@pingcap/tidb cumulative stars across months',
      sql: `
        SELECT
            t_month,
            stars,
            SUM(stars) OVER(ORDER BY t_month ASC) AS cumulative_stars
        FROM (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
                COUNT(DISTINCT actor_login) AS stars
            FROM github_events ge
            WHERE
                ge.type = 'WatchEvent' AND ge.repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = 'pingcap/tidb')
            GROUP BY t_month
        ) star_counts
        ORDER BY t_month ASC;
      `
    },
    {
      question: 'The open source projects similar to @pingcap/tidb',
      sql: `
        SELECT *
        FROM github_repos, (
            SELECT repo_id, SUM(score) AS similarity
            FROM (
                (
                    SELECT repo_id, 5 AS score
                    FROM collection_items
                    WHERE collection_id IN (SELECT collection_id FROM collection_items WHERE repo_name = 'pingcap/tidb')
                )
                UNION ALL
                (
                    SELECT repo_id, 2 AS score
                    FROM github_repo_topics 
                    WHERE
                        topic IN (
                            SELECT topic
                            FROM github_repo_topics
                            WHERE repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = 'pingcap/tidb')
                        )
                )
            ) sub
            GROUP BY repo_id
            ORDER BY similarity DESC
            LIMIT 21
        ) AS sub
        WHERE github_repos.repo_id = sub.repo_id AND repo_name != 'pingcap/tidb'
        ORDER BY similarity DESC
        LIMIT 20;
      `
    }
  ];

  public comments: string[] = [
    'Select statement limit 20'
  ];
}
