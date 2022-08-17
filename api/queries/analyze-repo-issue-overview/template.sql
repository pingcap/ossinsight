SELECT
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
            type = 'IssuesEvent'
            AND repo_id = 41986369
            AND action = 'opened'
    ) AS issue_creators,
    (
        SELECT
            IFNULL(COUNT(1), 0) AS total
        FROM github_events
        WHERE
            type = 'IssueCommentEvent'
            AND repo_id = 41986369
            AND action = 'created'
    ) AS issue_comments,
    (
        SELECT
            IFNULL(COUNT(DISTINCT actor_login), 0) AS total
        FROM github_events
        WHERE
            type = 'IssueCommentEvent'
            AND repo_id = 41986369
            AND action = 'created'
    ) AS issue_commenters
;