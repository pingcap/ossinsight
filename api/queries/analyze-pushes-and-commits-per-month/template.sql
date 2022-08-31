SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') as event_month,
    IFNULL(COUNT(*), 0) AS pushes,
    SUM(COALESCE(push_distinct_size, push_size, 0)) AS commits
FROM github_events
WHERE repo_id = 41986369 and type = 'PushEvent'
GROUP BY 1
ORDER BY 1;
