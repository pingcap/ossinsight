SELECT
    /*+ read_from_storage(tiflash[github_events]) */
    db.group_name  AS repo_group_name,
    COUNT(distinct actor_login) AS num
FROM
    github_events github_events
    JOIN osdb_repos db ON db.id = github_events.repo_id
WHERE
    type = 'IssuesEvent'
    and action = 'opened'
    -- Exclude Bots
    and actor_login not like '%bot%'
    and actor_login not in (select login from blacklist_users)
GROUP BY 1
ORDER BY 2 DESC
