SELECT
    IFNULL(COUNT(*), 0) AS pushes
FROM github_events
WHERE
    type = 'PushEvent'
    AND repo_id = 41986369;
