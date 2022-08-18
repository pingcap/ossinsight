SELECT event_day, COUNT(*) AS events
FROM github_events ge
WHERE
    type = 'PullRequestEvent'
    AND event_day = CURRENT_DATE()
GROUP BY event_day
ORDER BY event_day;