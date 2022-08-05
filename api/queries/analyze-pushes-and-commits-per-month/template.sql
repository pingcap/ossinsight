SELECT
    event_month,
    IFNULL(COUNT(*), 0) AS pushes,
    SUM(COALESCE(push_distinct_size, push_size, 0)) AS commits
FROM github_events
WHERE repo_id = 41986369 and type = 'PushEvent'
GROUP BY event_month
ORDER BY event_month;