SELECT
    IFNULL(SUM(push_distinct_size), 0) AS commits
FROM github_events
WHERE
    type = 'PushEvent'
    AND repo_id = 41986369;
