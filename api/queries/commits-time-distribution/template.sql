SELECT
    DAYOFWEEK(created_at) - 1 AS dayofweek,
    HOUR(created_at) AS hour,
    SUM(push_distinct_size) AS pushes
FROM github_events
WHERE
    repo_id = 41986369
    AND type = 'PushEvent'
    AND action IS NULL
    AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
GROUP BY dayofweek, hour
ORDER BY dayofweek, hour
;