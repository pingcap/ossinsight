SELECT
    COUNT(DISTINCT actor_id) AS developers,
    COUNT(DISTINCT repo_id) AS repos,
    SUM(IF(action = 'closed' AND pr_merged = true, additions, 0)) AS additions,
    SUM(IF(action = 'closed' AND pr_merged = true, deletions, 0)) AS deletions,
    COUNT(DISTINCT IF(action = 'opened', pr_or_issue_id, NULL)) AS opened_prs,
    COUNT(DISTINCT IF(action = 'closed' AND pr_merged = false, pr_or_issue_id, NULL)) AS closed_prs,
    COUNT(DISTINCT IF(action = 'closed' AND pr_merged = true, pr_or_issue_id, NULL)) AS merged_prs
FROM
    github_events ge
WHERE
    type = 'PullRequestEvent'
    AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
;
