USE gharchive_dev;

SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    SUM(additions) AS additions,
    SUM(deletions) AS deletions,
    SUM(additions) - SUM(deletions) AS net_additions,
    SUM(additions) + SUM(deletions) AS changes
FROM github_events
WHERE
    repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
    AND type = 'PullRequestEvent'
    AND action = 'closed'
    AND pr_merged = true
    AND created_at >= ${from}
    AND created_at <= ${to}
GROUP BY 1
ORDER BY 1
;
