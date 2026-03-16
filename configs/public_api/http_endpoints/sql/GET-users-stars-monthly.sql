USE gharchive_dev;

SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    COUNT(*) AS stars
FROM github_events ge
WHERE
    actor_id = (SELECT id FROM github_users WHERE login = ${username} LIMIT 1)
    AND type = 'WatchEvent'
    AND action = 'started'
    AND ge.created_at >= ${from}
    AND ge.created_at <= ${to}
GROUP BY 1
ORDER BY 1