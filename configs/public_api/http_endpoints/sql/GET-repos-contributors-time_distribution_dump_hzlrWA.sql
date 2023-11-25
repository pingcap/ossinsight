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
    AND
      CASE
        WHEN ${from} = '' THEN created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        ELSE (created_at >= ${from} AND created_at <= ${to})
      END
GROUP BY dayofweek, hour
ORDER BY dayofweek, hour
;


