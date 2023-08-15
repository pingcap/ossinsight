SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    COUNT(*) AS events
FROM github_events
WHERE
    repo_id = ${repoId}
    AND created_at >= '${from}'
    AND created_at < '${to}'
GROUP BY event_month
ORDER BY event_month
;
