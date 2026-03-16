INSERT INTO mv_repo_monthly_summary(repo_id, month, stars, pull_requests, pull_request_creators, issues, issue_creators)
WITH repos AS (
    SELECT repo_id
    FROM collection_items ci
    GROUP BY repo_id
)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge, ci]) */
    ge.repo_id,
    DATE_FORMAT(ge.created_at, '%Y-%m-01') AS month,
    COUNT(IF(ge.type = 'WatchEvent', 1, NULL)) AS new_stars,
    COUNT(IF(ge.type = 'PullRequestEvent', 1, NULL)) AS new_pull_requests,
    COUNT(IF(ge.type = 'IssuesEvent', 1, NULL)) AS new_issues,
    COUNT(DISTINCT IF(ge.type = 'PullRequestEvent', ge.actor_login, NULL)) AS new_pull_request_creators,
    COUNT(DISTINCT IF(ge.type = 'IssuesEvent', ge.actor_login, NULL)) AS new_issue_creators
FROM github_events ge
JOIN repos r ON ge.repo_id = r.repo_id
WHERE
    ge.type IN ('WatchEvent', 'PullRequestEvent', 'IssuesEvent')
    AND ge.action IN ('opened', 'created', 'started')
    AND ge.created_at >= :from
    AND ge.created_at < :to
GROUP BY
    repo_id, month
ORDER BY
    repo_id, month
ON DUPLICATE KEY UPDATE
    stars = new_stars,
    pull_requests = new_pull_requests,
    issues = new_issue_creators,
    pull_request_creators = new_pull_request_creators,
    issue_creators = new_issue_creators
;