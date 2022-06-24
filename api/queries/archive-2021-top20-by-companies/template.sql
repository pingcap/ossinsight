SELECT
    /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */
    TRIM(LOWER(REPLACE(u.company, '@', ''))) AS company,
    COUNT(DISTINCT actor_id)                 AS users_count
FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
         JOIN users u ON u.login = github_events.actor_login
WHERE event_year = 2021
  AND github_events.type IN (
                             'IssuesEvent',
                             'PullRequestEvent',
                             'IssueCommentEvent',
                             'PullRequestReviewCommentEvent',
                             'CommitCommentEvent',
                             'PullRequestReviewEvent'
    )
  AND u.company IS NOT NULL
  AND u.company != ''
  AND u.company != 'none'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20