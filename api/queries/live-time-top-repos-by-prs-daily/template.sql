SELECT
        repo_id,
        ANY_VALUE(repo_name) AS repo_name,
        COUNT(DISTINCT CASE WHEN action = 'opened' THEN pr_or_issue_id ELSE NULL END) AS opened_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND pr_merged = false THEN pr_or_issue_id ELSE NULL END) AS closed_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND pr_merged = true THEN pr_or_issue_id ELSE NULL END) AS merged_prs,
        COUNT(DISTINCT pr_or_issue_id) AS total_prs
FROM github_events ge
WHERE
        type = 'PullRequestEvent'
        AND action IN ('opened', 'closed')
        AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY repo_id
ORDER BY total_prs DESC
LIMIT 5