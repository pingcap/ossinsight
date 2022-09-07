SELECT
    COUNT(DISTINCT actor_id) AS developers,
    COUNT(DISTINCT repo_id) AS repos,
    SUM(CASE WHEN action = 'closed' AND pr_merged = true THEN additions ELSE 0 END) AS additions,
    SUM(CASE WHEN action = 'closed' AND pr_merged = true THEN deletions ELSE 0 END) AS deletions,
    COUNT(DISTINCT CASE WHEN action = 'opened' THEN pr_or_issue_id ELSE NULL END) AS opened_prs,
    COUNT(DISTINCT CASE WHEN action = 'closed' AND pr_merged = false THEN pr_or_issue_id ELSE NULL END) AS closed_prs,
    COUNT(DISTINCT CASE WHEN action = 'closed' AND pr_merged = true THEN pr_or_issue_id ELSE NULL END) AS merged_prs
FROM
    github_events ge
WHERE
    type = 'PullRequestEvent'
    AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)