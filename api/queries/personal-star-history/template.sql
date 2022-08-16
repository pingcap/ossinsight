SELECT
    event_month AS star_month,
    COUNT(1) AS cnt
FROM github_events ge
WHERE
    actor_id = 5086433
    AND type = 'WatchEvent'
    AND action = 'started'
GROUP BY event_month
ORDER BY event_month