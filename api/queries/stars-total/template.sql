SELECT
    IFNULL(COUNT(DISTINCT actor_login), 0) AS total
FROM github_events
WHERE
    type = 'WatchEvent'
    AND repo_id = 41986369;
