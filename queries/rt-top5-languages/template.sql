WITH
    datetime_range
        AS (SELECT DATE_FORMAT(MAX(created_at) - INTERVAL 1 HOUR, '%Y-%m-%d %H:00:00') AS start
                 , DATE_FORMAT(MAX(created_at), '%Y-%m-%d %H:00:00')                   AS end
            FROM github_events)

SELECT language  AS language,
       COUNT(*) AS num
FROM github_events github_events
         JOIN db_repos db ON db.id = github_events.repo_id
WHERE created_at >= (SELECT start FROM datetime_range)
  AND created_at < (SELECT end FROM datetime_range)
  AND type = 'PullRequestEvent'
  AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 5
