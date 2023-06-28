SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') as event_month,
    COUNT(DISTINCT actor_login) as month_pr_count
FROM github_events ge
WHERE
    type = 'PullRequestEvent'
    AND repo_id = 41986369
    AND action = 'opened'
GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')