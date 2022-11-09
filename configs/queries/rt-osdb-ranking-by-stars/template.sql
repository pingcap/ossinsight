SELECT
    db.group_name  AS repo_group_name,
    COUNT(distinct actor_login) AS num
FROM
    github_events github_events
    JOIN osdb_repos db ON db.id = github_events.repo_id
WHERE type = 'WatchEvent'
GROUP BY 1
ORDER BY 2 DESC
