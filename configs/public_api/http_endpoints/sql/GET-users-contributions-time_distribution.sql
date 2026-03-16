USE gharchive_dev;

SELECT
    DAYOFWEEK(created_at) - 1 AS dayofweek,
    HOUR(created_at) AS hour,
    COUNT(*) AS contributions
FROM github_events ge
WHERE
    actor_id = (SELECT id FROM github_users WHERE login = ${username} LIMIT 1)
    AND CASE
        WHEN ${type} = 'pull_requests' THEN (type = 'PullRequestEvent' AND action = 'opened')
        WHEN ${type} = 'issues' THEN (type = 'IssuesEvent' AND action = 'opened')
        WHEN ${type} = 'issue_comments' THEN (type = 'IssueCommentEvent' AND action = 'created')
        WHEN ${type} = 'reviews' THEN (type = 'PullRequestReviewEvent' AND action = 'created')
        WHEN ${type} = 'review_comments' THEN (type = 'PullRequestReviewCommentEvent' AND action = 'created') 
        WHEN ${type} = 'pushes' THEN (type = 'PushEvent' AND action = '')
        ELSE true
    END
    AND ge.created_at >= ${from}
    AND ge.created_at <= ${to}
GROUP BY dayofweek, hour, type
ORDER BY dayofweek, hour, type
