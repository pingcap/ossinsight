SELECT
    DAYOFWEEK(created_at) - 1 AS dayofweek,
    HOUR(created_at) AS hour,
    SUM(push_distinct_size) AS pushes
FROM github_events ge
WHERE
    type = 'PushEvent'
    AND actor_login = 'dependabot[bot]'
    AND created_at >= '2019-01-01'
GROUP BY dayofweek, hour
ORDER BY dayofweek, hour