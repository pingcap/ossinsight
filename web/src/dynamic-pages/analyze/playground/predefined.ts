export type PredefinedQuestion = {
  id: string;
  title: string;
  sql: string;
};

export const predefinedQuestions: PredefinedQuestion[] = [
  {
    id: 'first_pr',
    title: 'Who created the first pull request of this repo?',
    sql: `SELECT *
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND type = 'PullRequestEvent'
          ORDER BY
              created_at ASC
              LIMIT
              1
    ;`,
  },
  {
    id: 'first_issue',
    title: 'Who closed the first issue?',
    sql: `SELECT *
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND type = 'IssuesEvent'
            AND action = 'closed'
          ORDER BY
              created_at ASC
              LIMIT
              1`,
  },
  {
    id: 'latest_stargazer',
    title: 'Who is the latest stargazer?',
    sql: `SELECT *
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND type = 'WatchEvent'
          ORDER BY
              created_at DESC -- Try to use ASC to get the first stargazer
              LIMIT
              1
    ;`,
  },
  {
    id: 'active_reviewer',
    title: 'Who reviewed the most of code?',
    sql: `SELECT actor_login,
                 COUNT(*) AS comments
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND actor_login NOT LIKE '%bot%'
            AND type IN (
              'IssueCommentEvent'
              , 'PullRequestReviewEvent'
              , 'PullRequestReviewCommentEvent'
              )
          GROUP BY
              actor_login
          ORDER BY
              comments DESC
              LIMIT
              5
    ;`,
  },
  {
    id: 'most_loc_added',
    title: 'Who contributed the most lines of code?',
    sql: `SELECT actor_login,
                 SUM(additions) AS loc_added
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND type = 'PullRequestEvent'
            AND actor_login NOT LIKE '%bot%'
          GROUP BY
              actor_login
          ORDER BY
              2 DESC
              LIMIT
              5`,
  },
  {
    id: 'star_again_and_again',
    title: 'Who star/unstar this repo again and again...',
    sql: `SELECT actor_login,
                 COUNT(*) AS cnt
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND type = 'WatchEvent' -- There is no unstar event in GitHub /events api
          GROUP BY
              actor_login
          HAVING
              cnt
               > 1
          ORDER BY
              2 DESC
              LIMIT
              100`,
  },
  {
    id: 'table_schema',
    title: 'Show table schema',
    sql: 'DESC github_events;',
  },
  {
    id: 'table_indexes',
    title: 'Show table indexes',
    sql: `SHOW indexes
FROM
  github_events;`,
  },
  {
    id: 'example_row',
    title: 'This is an example row',
    sql: `SELECT *
          FROM github_events
          WHERE repo_id = {{repoId}}
              LIMIT
              1`,
  },
  {
    id: 'total_rows',
    title: 'Total rows of this repo - Realtime',
    sql: `-- Delayed by 5 minutes: https://github.blog/changelog/2018-08-01-new-delay-public-events-api/
SELECT
  COUNT(*)
FROM
  github_events
WHERE
  -- repo_name = '{{repoName}}' -- try use this and find out the difference
  repo_id = {{repoId}}`,
  },
  {
    id: 'all_contributions_to_this_repo',
    title: 'All your contributions to this repo',
    sql: `SELECT *
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND actor_login = '?' -- input your GitHub ID here`,
  },
  {
    id: 'biggest_pr',
    title: 'Which is your biggest pull request to this repo',
    sql: `SELECT max(additions)
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND type = 'PullRequestEvent'
            AND actor_login = '?' -- input your GitHub ID here`,
  },
  {
    id: 'pr_or_push',
    title: 'Which do you prefer, pull request or push?',
    sql: `SELECT type,
                 count(*)
          FROM github_events
          WHERE repo_id = {{repoId}}
            AND (
              (
              type = 'PullRequestEvent'
            AND action = 'opened'
              )
             OR type = 'PushEvent'
              )
            AND actor_login = '?' -- input your GitHub ID here
          GROUP BY
              type`,
  },
];

export function getTableSchemaQuestion () {
  return predefinedQuestions.find(question => question.id === 'table_schema');
}
