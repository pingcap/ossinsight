SELECT
    IFNULL(COUNT(DISTINCT comment_id), 0) AS comments
FROM github_events
WHERE
    type = 'IssueCommentEvent'
    AND repo_id = 41986369;
