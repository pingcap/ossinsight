SELECT
        actor_id,
        ANY_VALUE(actor_login) AS actor_login,
        COUNT(DISTINCT CASE WHEN action = 'opened' THEN pr_or_issue_id ELSE NULL END) AS opened_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND pr_merged = false THEN pr_or_issue_id ELSE NULL END) AS closed_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND pr_merged = true THEN pr_or_issue_id ELSE NULL END) AS merged_prs,
        COUNT(DISTINCT pr_or_issue_id) AS total_prs
FROM github_events ge
WHERE
        type = 'PullRequestEvent'
        AND action IN ('opened', 'closed')
        AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
        AND actor_login NOT LIKE '%[bot]'
        AND actor_login NOT LIKE '%bot'
GROUP BY actor_id
ORDER BY total_prs DESC
LIMIT 5