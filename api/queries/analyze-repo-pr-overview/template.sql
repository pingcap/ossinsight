WITH pull_requests AS (
    SELECT
        IFNULL(COUNT(DISTINCT number), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = 41986369
), pull_request_creators AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = 41986369
), pull_request_reviews AS (
    SELECT
        IFNULL(COUNT(1), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestReviewEvent'
        AND repo_id = 41986369
), pull_request_reviewers AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestReviewEvent'
        AND repo_id = 41986369
)
SELECT
    (SELECT total FROM pull_requests) AS pull_requests,
    (SELECT total FROM pull_request_creators) AS pull_request_creators,
    (SELECT total FROM pull_request_reviews) AS pull_request_reviews,
    (SELECT total FROM pull_request_reviewers) AS pull_request_reviewers
;