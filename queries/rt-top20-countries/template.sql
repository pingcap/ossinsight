WITH datetime_range AS (
    SELECT
        DATE_FORMAT(MAX(created_at) - INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00') AS start,
        DATE_FORMAT(MAX(created_at), '%Y-%m-%d %H:00:00')                   AS end
    FROM
        github_events
)
SELECT
    /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */
    u.country_code           AS country,
    COUNT(DISTINCT actor_id) AS num
FROM
    github_events github_events
    JOIN db_repos db ON db.id = github_events.repo_id
    JOIN users u ON u.login = github_events.actor_login
WHERE github_events.created_at >= (SELECT start FROM datetime_range)
  AND github_events.created_at < (SELECT end FROM datetime_range)
  AND github_events.type IN (
    'IssuesEvent', 'PullRequestEvent', 'IssueCommentEvent',
    'PullRequestReviewCommentEvent', 'CommitCommentEvent',
    'PullRequestReviewEvent'
    )
  AND u.country_code IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20;
