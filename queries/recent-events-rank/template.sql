SELECT ANY_VALUE(repo_name)    AS repo_name,
       COUNT(github_events.id) AS events
FROM github_events AS github_events
WHERE created_at < DATE_FORMAT(UTC_TIMESTAMP - INTERVAL 1 - 10 HOUR, '%Y-%m-%d %H:00:00')
  AND created_at >= DATE_FORMAT(UTC_TIMESTAMP - INTERVAL 2 - 10 HOUR, '%Y-%m-%d %H:00:00')
GROUP BY github_events.repo_id
ORDER BY events DESC
LIMIT 500;