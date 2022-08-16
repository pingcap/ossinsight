SELECT
    event_month,
    SUM(additions) AS additions,
    SUM(deletions) AS deletions,
    SUM(additions + deletions) AS changes
FROM github_events ge
WHERE
    creator_user_id = 5086433
    AND type = 'PullRequestEvent'
    AND action = 'closed'
    AND pr_merged = true
GROUP BY event_month
ORDER BY event_month
;