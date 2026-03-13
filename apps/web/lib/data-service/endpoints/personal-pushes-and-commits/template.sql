SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    IFNULL(COUNT(*), 0) AS pushes,
    IFNULL(SUM(push_distinct_size), 0) AS commits
FROM github_events ge
WHERE 
    type = 'PushEvent' 
    AND actor_id = 5086433
    AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
GROUP BY 1
ORDER BY 1