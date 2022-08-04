SELECT
    IFNULL(COUNT(DISTINCT actor_login), 0) AS pull_request_reviewers
FROM github_events
WHERE
    type = 'PullRequestReviewEvent'
    AND repo_id = 41986369;
