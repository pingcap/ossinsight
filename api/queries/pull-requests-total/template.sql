SELECT
    IFNULL(COUNT(DISTINCT number), 0) AS pull_requests
FROM github_events
WHERE
    type = 'PullRequestEvent'
    AND repo_id = 41986369;
