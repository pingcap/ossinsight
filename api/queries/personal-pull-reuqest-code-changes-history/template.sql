WITH user_prs AS (
    SELECT DISTINCT pr_or_issue_id AS pr_id
    FROM github_events ge
    WHERE type = 'PullRequestEvent' AND actor_id = 5086433 AND action = 'opened' 
)
SELECT
    event_month,
    SUM(additions) AS additions,
    SUM(deletions) AS deletions,
    SUM(additions + deletions) AS changes
FROM github_events ge
JOIN user_prs pr ON ge.pr_or_issue_id = pr.pr_id
WHERE type = 'PullRequestEvent' AND action = 'closed' AND pr_merged = true
GROUP BY event_month
ORDER BY event_month
;