WITH repo_stars AS (
    SELECT
        41986369 AS repo_id,
        stars AS total
    FROM github_repos
    WHERE
        repo_id = 41986369
        AND is_deleted = 0
        AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
), event_stars AS (
    SELECT
        41986369 AS repo_id, IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id = 41986369
        AND action = 'started'
), stars AS (
    SELECT
        41986369 AS repo_id,
        COALESCE(
            (SELECT total FROM repo_stars WHERE repo_id = 41986369),
            (SELECT total FROM event_stars WHERE repo_id = 41986369)
        ) AS total
), commits AS (
    SELECT
        41986369 AS repo_id, IFNULL(SUM(push_distinct_size), 0) AS total
    FROM github_events
    WHERE
        type = 'PushEvent'
        AND repo_id = 41986369
), issues AS (
    SELECT
        41986369 AS repo_id, IFNULL(COUNT(DISTINCT number), 0) AS total
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id = 41986369
), pull_request_creators AS (
    SELECT
        41986369 AS repo_id, IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = 41986369
        AND action = 'opened'
)
SELECT
    41986369 AS repo_id,
    s.total AS stars,
    c.total AS commits,
    i.total AS issues,
    prc.total AS pull_request_creators
FROM (
    SELECT 41986369 AS repo_id
) sub
LEFT JOIN stars s ON sub.repo_id = s.repo_id
LEFT JOIN commits c ON sub.repo_id = c.repo_id
LEFT JOIN issues i ON sub.repo_id = i.repo_id
LEFT JOIN pull_request_creators prc ON sub.repo_id = prc.repo_id
;
