SELECT
    db.name,
    SUM(event_year = 2020)                                    AS stars2020,
    SUM(event_year = 2021)                                    AS stars2021,
    ROUND((SUM(event_year = 2021) - SUM(event_year = 2020)) / SUM(event_year = 2020), 3) AS yoy
FROM github_events
JOIN db_repos AS db ON db.id = github_events.repo_id
WHERE type = 'WatchEvent'
    AND event_year IN (2021, 2020)
GROUP BY db.name
HAVING stars2020 > 0
ORDER BY yoy ASC
LIMIT 20