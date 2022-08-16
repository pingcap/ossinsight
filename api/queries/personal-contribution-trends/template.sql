SELECT
    CASE type
        WHEN 'IssuesEvent' THEN 'issues'
        WHEN 'IssueCommentEvent' THEN 'issue_comments'
        WHEN 'PullRequestEvent' THEN 'pull_requests'
        WHEN 'PullRequestReviewEvent' THEN 'reviews'
        WHEN 'PullRequestReviewCommentEvent' THEN 'review_comments'
        WHEN 'PushEvent' THEN 'pushes'
    END AS contribution_type,
    event_month,
    COUNT(DISTINCT id) AS cnt 
FROM github_events ge
WHERE
    actor_id = 5086433 AND
    (
        (type = 'PullRequestEvent' AND action = 'opened') OR
        (type = 'IssuesEvent' AND action = 'opened') OR
        (type = 'IssueCommentEvent' AND action = 'created') OR
        (type = 'PullRequestReviewEvent' AND action = 'created') OR
        (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
        (type = 'PushEvent' AND action IS NULL)
    )
GROUP BY type, event_month
ORDER BY event_month
;