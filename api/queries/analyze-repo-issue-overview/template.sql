WITH issues AS (
    SELECT
        IFNULL(COUNT(DISTINCT number), 0) AS total
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id = 41986369
), issue_creators AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id = 41986369
), issue_comments AS (
    SELECT
        IFNULL(COUNT(1), 0) AS total
    FROM github_events
    WHERE
        type = 'IssueCommentEvent'
        AND repo_id = 41986369
), issue_commenters AS (
    SELECT
        IFNULL(COUNT(DISTINCT actor_login), 0) AS total
    FROM github_events
    WHERE
        type = 'IssueCommentEvent'
        AND repo_id = 41986369
)
SELECT
    (SELECT total FROM issues) AS issues,
    (SELECT total FROM issue_creators) AS issue_creators,
    (SELECT total FROM issue_comments) AS issue_comments,
    (SELECT total FROM issue_commenters) AS issue_commenters
;