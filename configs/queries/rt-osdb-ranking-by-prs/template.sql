SELECT
    db.group_name  AS repo_group_name,
    COUNT(distinct pr_or_issue_id) AS num
FROM
    github_events github_events
    JOIN osdb_repos db ON db.id = github_events.repo_id
WHERE type = 'PullRequestEvent'
GROUP BY 1
ORDER BY 2 DESC
