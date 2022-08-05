SELECT
    IFNULL(COUNT(*), 0) AS pull_request_reviews
FROM github_events
WHERE
    type = 'PullRequestReviewEvent'
    AND repo_id = 41986369;
