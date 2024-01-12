WITH contributions AS (
    SELECT
        type,
        repo_id,
        FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name
    FROM github_events ge
    WHERE
        actor_id = 5086433
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'IssueCommentEvent' AND action = 'created') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action = '')
        )
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
)
SELECT
    repo_id,
    repo_name,
    CASE type
        WHEN 'IssuesEvent' THEN 'issues'
        WHEN 'IssueCommentEvent' THEN 'issue_comments'
        WHEN 'PullRequestEvent' THEN 'pull_requests'
        WHEN 'PullRequestReviewEvent' THEN 'reviews'
        WHEN 'PullRequestReviewCommentEvent' THEN 'review_comments'
        WHEN 'PushEvent' THEN 'pushes'
    END AS type,
    COUNT(1) AS cnt 
FROM contributions c
GROUP BY repo_id, type
ORDER BY repo_id, type 
;