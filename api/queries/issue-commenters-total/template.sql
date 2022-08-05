SELECT
    IFNULL(COUNT(DISTINCT actor_login), 0) AS commenters
FROM github_events
WHERE
    type = 'IssueCommentEvent'
    AND repo_id = 41986369;
