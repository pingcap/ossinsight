SELECT ANY_VALUE(repo_name)    AS repo_name,
       COUNT(github_events.id) AS events
FROM github_events AS github_events
         JOIN db_repos AS repo_subset ON github_events.repo_id = repo_subset.id
WHERE created_at < DATE_FORMAT(UTC_TIMESTAMP - INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00')
  AND created_at >= DATE_FORMAT(UTC_TIMESTAMP - INTERVAL 2 HOUR, '%Y-%m-%d %H:00:00')
GROUP BY github_events.repo_id
ORDER BY events DESC
LIMIT 10;
