SELECT
    ci.repo_name  AS repo_name,
    COUNT(distinct actor_login) AS num
FROM
    github_events ge
    JOIN collection_items ci ON ge.repo_id = ci.repo_id
    JOIN collections c ON ci.collection_id = c.id
WHERE
    type = 'IssuesEvent'
    AND action = 'opened'
    AND c.id = 10005
    -- Exclude Bots
    and actor_login not like '%bot%'
    and actor_login not in (select login from blacklist_users)
GROUP BY 1
ORDER BY 2 DESC
;