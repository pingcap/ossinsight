SELECT
    /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */
    ANY_VALUE(repo_name)    AS repo_name,
    COUNT(DISTINCT github_events.actor_id) AS events
FROM
    github_events AS github_events
    JOIN db_repos AS repo_subset ON github_events.repo_id = repo_subset.id
WHERE github_events.type = 'PullRequestEvent'
  AND github_events.action = 'closed'
  AND github_events.pr_merged IS TRUE
  AND created_at < DATE_FORMAT(UTC_TIMESTAMP - INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00')
  AND created_at >= DATE_FORMAT(UTC_TIMESTAMP - INTERVAL 2 HOUR, '%Y-%m-%d %H:00:00')
GROUP BY github_events.repo_id
ORDER BY events DESC
LIMIT 10;
