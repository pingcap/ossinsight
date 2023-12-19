USE gharchive_dev;
WITH repo AS (
    SELECT repo_id
    FROM github_repos
    WHERE repo_name = CONCAT(${owner}, '/', ${repo})
    LIMIT 1
), issues AS (
    SELECT
        COUNT(*) AS total
    FROM github_events
    WHERE
        repo_id = (SELECT repo_id FROM repo)
        AND type = 'IssuesEvent'
        AND action = 'opened'
), issue_creators AS (
    SELECT
        COUNT(DISTINCT actor_login) AS total
    FROM github_events
    WHERE
        repo_id = (SELECT repo_id FROM repo)
        AND type = 'IssuesEvent'
        AND action = 'opened'
), issue_comments AS (
    SELECT
        COUNT(*) AS total
    FROM github_events
    WHERE
        repo_id = (SELECT repo_id FROM repo)
        AND type = 'IssueCommentEvent'
        AND action = 'created'
), issue_commenters AS (
    SELECT
        COUNT(DISTINCT actor_login) AS total
    FROM github_events
    WHERE
        repo_id = (SELECT repo_id FROM repo)
        AND type = 'IssueCommentEvent'
        AND action = 'created'
)
SELECT
    IFNULL(i.total, 0) AS issues,
    IFNULL(ic.total, 0) AS issue_creators,
    IFNULL(ico.total, 0) AS issue_comments,
    IFNULL(icc.total, 0) AS issue_commenters
FROM repo r
LEFT JOIN issues i ON 1 = 1
LEFT JOIN issue_creators ic ON 1 = 1
LEFT JOIN issue_comments ico ON 1 = 1
LEFT JOIN issue_commenters icc ON 1 = 1
;