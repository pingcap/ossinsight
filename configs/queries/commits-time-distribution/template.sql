SELECT
    DAYOFWEEK(created_at) - 1 AS dayofweek,
    HOUR(created_at) AS hour,
    COUNT(1) AS pushes
FROM github_events
WHERE
    repo_id = 41986369
    AND type = 'PushEvent'
    AND action = ''
    AND (created_at BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR) AND CURRENT_DATE())
GROUP BY dayofweek, hour
ORDER BY dayofweek, hour
;
