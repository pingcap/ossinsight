SELECT
    db.group_name AS repo_group_name,
    COUNT(DISTINCT actor_login) AS num
FROM
    github_events github_events
    JOIN osdb_repos db ON db.id = github_events.repo_id
WHERE
    type = 'IssuesEvent'
    AND action = 'opened'
    -- Exclude Bots
    AND actor_login NOT LIKE '%bot%'
    AND actor_login NOT IN (SELECT login FROM blacklist_users)
GROUP BY 1
ORDER BY 2 DESC
