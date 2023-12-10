USE gharchive_dev;
WITH repo AS (
    SELECT repo_id
    FROM github_repos
    WHERE repo_name = CONCAT(${owner}, '/', ${repo})
    LIMIT 1
), pull_requests AS (
    SELECT
        IFNULL(COUNT(DISTINCT number), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = (SELECT repo_id FROM repo)
), pull_request_creators AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id = (SELECT repo_id FROM repo)
), pull_request_reviews AS (
    SELECT
        IFNULL(COUNT(1), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestReviewEvent'
        AND action = 'created'
        AND repo_id = (SELECT repo_id FROM repo)
), pull_request_reviewers AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestReviewEvent'
        AND action = 'created'
        AND repo_id = (SELECT repo_id FROM repo)
)
SELECT
    pr.total AS pull_requests,
    prc.total AS pull_request_creators,
    prr.total AS pull_request_reviews,
    prrc.total AS pull_request_reviewers
FROM repo r
LEFT JOIN pull_requests pr ON 1 = 1
LEFT JOIN pull_request_creators prc ON 1 = 1
LEFT JOIN pull_request_reviews prr ON 1 = 1
LEFT JOIN pull_request_reviewers prrc ON 1 = 1
;