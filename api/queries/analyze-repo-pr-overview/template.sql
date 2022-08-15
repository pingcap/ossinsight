SELECT
    (
        SELECT
            IFNULL(COUNT(DISTINCT number), 0) AS total
        FROM github_events
        WHERE
            type = 'PullRequestEvent'
            AND repo_id = 41986369
    ) AS pull_requests,
    (
        SELECT
            IFNULL(COUNT(DISTINCT actor_login), 0) AS total
        FROM github_events
        WHERE
            type = 'PullRequestEvent'
            AND repo_id = 41986369
    ) AS pull_request_creators,
    (
        SELECT
            IFNULL(COUNT(1), 0) AS total
        FROM github_events
        WHERE
            type = 'PullRequestReviewEvent'
            AND repo_id = 41986369
    ) AS pull_request_reviews,
    (
        SELECT
            IFNULL(COUNT(DISTINCT actor_login), 0) AS total
        FROM github_events
        WHERE
            type = 'PullRequestReviewEvent'
            AND repo_id = 41986369
    ) AS pull_request_reviewers
;