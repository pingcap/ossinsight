INSERT INTO mv_repo_pull_requests(repo_id, number)
SELECT repo_id, number
FROM github_events ge
WHERE
    type = 'PullRequestEvent'
    AND created_at >= :from
    AND created_at <= :to
ON DUPLICATE KEY UPDATE
    mv_repo_pull_requests.repo_id = VALUES(repo_id),
    mv_repo_pull_requests.number = VALUES(number);