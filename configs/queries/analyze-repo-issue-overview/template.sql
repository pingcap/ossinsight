WITH issues AS (
    SELECT
        41986369 AS repo_id, IFNULL(COUNT(DISTINCT number), 0) AS total
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id = 41986369
), issue_creators AS (
    SELECT
        41986369 AS repo_id, IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id = 41986369
        AND action = 'opened'
), issue_comments AS (
    SELECT
        41986369 AS repo_id, IFNULL(COUNT(1), 0) AS total
    FROM github_events
    WHERE
        type = 'IssueCommentEvent'
        AND repo_id = 41986369
        AND action = 'created'
), issue_commenters AS (
    SELECT
        41986369 AS repo_id, IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'IssueCommentEvent'
        AND repo_id = 41986369
        AND action = 'created'
)
SELECT
    41986369 AS repo_id,
    i.total AS issues,
    ic.total AS issue_creators,
    ico.total AS issue_comments,
    icc.total AS issue_commenters
FROM (
    SELECT 41986369 AS repo_id
) sub
LEFT JOIN issues i ON sub.repo_id = i.repo_id
LEFT JOIN issue_creators ic ON sub.repo_id = ic.repo_id
LEFT JOIN issue_comments ico ON sub.repo_id = ico.repo_id
LEFT JOIN issue_commenters icc ON sub.repo_id = icc.repo_id
;