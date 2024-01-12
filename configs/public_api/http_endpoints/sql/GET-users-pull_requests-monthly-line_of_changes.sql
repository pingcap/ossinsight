USE gharchive_dev;

SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    SUM(additions) AS additions,
    SUM(deletions) AS deletions,
    SUM(additions + deletions) AS changes
FROM github_events ge
WHERE
    creator_user_id = (SELECT id FROM github_users WHERE login = ${username} LIMIT 1)
    AND type = 'PullRequestEvent'
    AND action = 'closed'
    AND pr_merged = true
    AND ge.created_at >= ${from}
    AND ge.created_at <= ${to}
GROUP BY 1
ORDER BY 1
;
