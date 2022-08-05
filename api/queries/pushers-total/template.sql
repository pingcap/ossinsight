SELECT
    IFNULL(COUNT(DISTINCT actor_login), 0) AS pushers
FROM github_events
WHERE
    type = 'PushEvent'
    AND repo_id = 41986369;
