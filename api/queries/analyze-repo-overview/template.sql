SELECT
    (
        SELECT
            IFNULL(COUNT(DISTINCT actor_login), 0) AS total
        FROM github_events
        WHERE
            type = 'WatchEvent'
            AND repo_id = 41986369
            AND action = 'started'
    ) AS stars,
    (
        SELECT
            IFNULL(SUM(push_distinct_size), 0) AS total
        FROM github_events
        WHERE
            type = 'PushEvent'
            AND repo_id = 41986369
    ) AS commits,
    (
        SELECT
            IFNULL(COUNT(DISTINCT number), 0) AS total
        FROM github_events
        WHERE
            type = 'IssuesEvent'
            AND repo_id = 41986369
    ) AS issues,
    (
        SELECT
            IFNULL(COUNT(DISTINCT actor_login), 0) AS total
        FROM github_events
        WHERE
            type = 'PullRequestEvent'
            AND repo_id = 41986369
            AND action = 'opened'
    ) AS pull_request_creators
;
