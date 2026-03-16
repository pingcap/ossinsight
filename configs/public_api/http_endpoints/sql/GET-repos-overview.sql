USE gharchive_dev;
WITH repo AS (
    SELECT repo_id
    FROM github_repos
    WHERE repo_name = CONCAT(${owner}, '/', ${repo})
    LIMIT 1
), stars AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id = (SELECT repo_id FROM repo)
        AND action = 'started'
), commits AS (
    SELECT
        IFNULL(SUM(push_distinct_size), 0) AS total
    FROM github_events
    WHERE
        type = 'PushEvent'
        AND repo_id = (SELECT repo_id FROM repo)
), issues AS (
    SELECT
        IFNULL(COUNT(DISTINCT number), 0) AS total
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id = (SELECT repo_id FROM repo)
), pull_request_creators AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = (SELECT repo_id FROM repo)
        AND action = 'opened'
)
SELECT
    s.total AS stars,
    c.total AS commits,
    i.total AS issues,
    prc.total AS pull_request_creators
FROM repo r
LEFT JOIN stars s ON 1 = 1
LEFT JOIN commits c ON 1 = 1
LEFT JOIN issues i ON 1 = 1
LEFT JOIN pull_request_creators prc ON 1 = 1
;