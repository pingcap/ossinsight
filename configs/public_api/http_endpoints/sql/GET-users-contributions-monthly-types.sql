USE gharchive_dev;

SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
    CASE type
        WHEN 'IssuesEvent' THEN 'issues'
        WHEN 'IssueCommentEvent' THEN 'issue_comments'
        WHEN 'PullRequestEvent' THEN 'pull_requests'           
        WHEN 'PullRequestReviewEvent' THEN 'reviews'
        WHEN 'PullRequestReviewCommentEvent' THEN 'review_comments'
        WHEN 'PushEvent' THEN 'pushes'
    END AS contribution_type,
    COUNT(*) AS contributions 
FROM github_events ge
WHERE
    actor_id = (SELECT id FROM github_users WHERE login = ${username} LIMIT 1)
    AND (
        (type = 'PullRequestEvent' AND action = 'opened') OR
        (type = 'IssuesEvent' AND action = 'opened') OR
        (type = 'IssueCommentEvent' AND action = 'created') OR
        (type = 'PullRequestReviewEvent' AND action = 'created') OR
        (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
        (type = 'PushEvent' AND action = '')
    )
    AND ge.created_at >= ${from}
    AND ge.created_at <= ${to}
GROUP BY type, 2
ORDER BY 2
;