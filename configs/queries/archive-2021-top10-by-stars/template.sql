SELECT
    db.name  AS repo_name,
    COUNT(DISTINCT actor_login) AS stars
FROM github_events
JOIN db_repos db ON db.id = github_events.repo_id
WHERE event_year = 2021 AND type = 'WatchEvent'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10
