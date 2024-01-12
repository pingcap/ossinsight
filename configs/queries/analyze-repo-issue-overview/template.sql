WITH issues AS (
    SELECT
        41986369 AS repo_id, COUNT(*) AS total
    FROM github_events
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
        AND action = 'opened'
), issue_creators AS (
    SELECT
        41986369 AS repo_id, COUNT(DISTINCT actor_login) AS total
    FROM github_events
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
        AND action = 'opened'
), issue_comments AS (
    SELECT
        41986369 AS repo_id, COUNT(*) AS total
    FROM github_events
    WHERE
        repo_id = 41986369
        AND type = 'IssueCommentEvent'
        AND action = 'created'
), issue_commenters AS (
    SELECT
        41986369 AS repo_id, COUNT(DISTINCT actor_login) AS total
    FROM github_events
    WHERE
        repo_id = 41986369
        AND type = 'IssueCommentEvent'
        AND action = 'created'
)
SELECT
    41986369 AS repo_id,
    IFNULL(i.total, 0) AS issues,
    IFNULL(ic.total, 0) AS issue_creators,
    IFNULL(ico.total, 0) AS issue_comments,
    IFNULL(icc.total, 0) AS issue_commenters
FROM (
    SELECT 41986369 AS repo_id
) sub
LEFT JOIN issues i ON sub.repo_id = i.repo_id
LEFT JOIN issue_creators ic ON sub.repo_id = ic.repo_id
LEFT JOIN issue_comments ico ON sub.repo_id = ico.repo_id
LEFT JOIN issue_commenters icc ON sub.repo_id = icc.repo_id
;