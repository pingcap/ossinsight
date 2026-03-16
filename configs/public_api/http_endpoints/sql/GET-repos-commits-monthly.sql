USE gharchive_dev;

SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') as event_month,
    IFNULL(COUNT(*), 0) AS pushes,
    SUM(COALESCE(push_distinct_size, push_size, 0)) AS commits
FROM github_events
WHERE
  type = 'PushEvent'
  AND action = ''
  AND repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
GROUP BY 1
ORDER BY 1;
