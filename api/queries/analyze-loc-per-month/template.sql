SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    SUM(additions) AS additions,
    SUM(deletions) AS deletions,
    SUM(additions) - SUM(deletions) AS net_additions,
    SUM(additions) + SUM(deletions) AS changes
FROM github_events
WHERE
    repo_id = 41986369
    AND type = 'PullRequestEvent'
    AND action = 'closed'
    AND pr_merged = true
GROUP BY 1
ORDER BY 1
;
