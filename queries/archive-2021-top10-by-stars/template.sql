SELECT
    /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */
    db.name  AS repo_name,
    COUNT(*) AS stars
FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
WHERE event_year = 2021
  AND type = 'WatchEvent'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10
