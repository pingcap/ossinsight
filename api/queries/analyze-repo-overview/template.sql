WITH stars AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id = 41986369
), commits AS (
    SELECT
        IFNULL(SUM(push_distinct_size), 0) AS total
    FROM github_events
    WHERE
        type = 'PushEvent'
        AND repo_id = 41986369
), issues AS (
    SELECT
        IFNULL(COUNT(DISTINCT number), 0) AS total
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id = 41986369
), forkers AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'ForkEvent'
        AND repo_id = 41986369
), pull_request_creators AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = 41986369
)
SELECT
    (SELECT total FROM stars) AS stars,
    (SELECT total FROM commits) AS commits,
    (SELECT total FROM issues) AS issues,
    (SELECT total FROM forkers) AS forkers,
    (SELECT total FROM pr_creators) AS pull_request_creators
;