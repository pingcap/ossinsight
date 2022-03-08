SELECT
    /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */
    db_repos.name AS repo_name,
    COUNT(*)      AS num
FROM
    github_events github_events
    JOIN db_repos ON db_repos.id = github_events.repo_id
WHERE type = 'PullRequestEvent'
  AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10
