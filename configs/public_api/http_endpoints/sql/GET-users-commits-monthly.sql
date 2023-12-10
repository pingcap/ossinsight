USE gharchive_dev;

SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    IFNULL(COUNT(*), 0) AS pushes,
    IFNULL(SUM(push_distinct_size), 0) AS commits
FROM github_events ge
WHERE 
    type = 'PushEvent' 
    AND actor_id = (SELECT id FROM github_users WHERE login = ${username} LIMIT 1)
    AND ge.created_at >= ${from}
    AND ge.created_at <= ${to}
GROUP BY 1
ORDER BY 1