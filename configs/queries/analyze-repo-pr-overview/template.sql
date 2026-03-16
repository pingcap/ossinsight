WITH pull_requests AS (
    SELECT
        41986369 AS repo_id,
        IFNULL(COUNT(DISTINCT number), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = 41986369
), pull_request_creators AS (
    SELECT
        41986369 AS repo_id, 
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = 41986369
        AND action = 'opened'
), pull_request_reviews AS (
    SELECT
        41986369 AS repo_id,
        IFNULL(COUNT(1), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestReviewEvent'
        AND repo_id = 41986369
        AND action = 'created'
), pull_request_reviewers AS (
    SELECT
        41986369 AS repo_id,
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestReviewEvent'
        AND repo_id = 41986369
        AND action = 'created'
)
SELECT
    41986369 AS repo_id,
    pr.total AS pull_requests,
    prc.total AS pull_request_creators,
    prr.total AS pull_request_reviews,
    prrc.total AS pull_request_reviewers
FROM (
    SELECT 41986369 AS repo_id
) sub
LEFT JOIN pull_requests pr ON sub.repo_id = pr.repo_id
LEFT JOIN pull_request_creators prc ON sub.repo_id = prc.repo_id
LEFT JOIN pull_request_reviews prr ON sub.repo_id = prr.repo_id
LEFT JOIN pull_request_reviewers prrc ON sub.repo_id = prrc.repo_id
;