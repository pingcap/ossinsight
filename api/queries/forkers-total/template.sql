SELECT
    IFNULL(COUNT(DISTINCT actor_login), 0) AS forkers
FROM github_events
WHERE
    type = 'ForkEvent'
    AND repo_id = 41986369;
