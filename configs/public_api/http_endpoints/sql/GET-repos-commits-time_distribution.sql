USE gharchive_dev;

SELECT
    DAYOFWEEK(created_at) - 1 AS dayofweek,
    HOUR(created_at) AS hour,
    COUNT(1) AS pushes
FROM github_events
WHERE
    repo_id IN (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
    AND type = 'PushEvent'
    AND action = ''
    AND created_at >= ${from}
    AND created_at <= ${to}
GROUP BY dayofweek, hour
ORDER BY dayofweek, hour
;