SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    COUNT(*) AS events
FROM github_events
WHERE
    repo_id = 41986369
    AND created_at >= '2000-01-01'
    AND created_at < '2099-12-31'
GROUP BY 1
ORDER BY 1
;
