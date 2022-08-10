SELECT event_day, COUNT(*) AS events
FROM github_events ge
WHERE
    event_year = YEAR(NOW())
GROUP BY event_day
ORDER BY event_day;