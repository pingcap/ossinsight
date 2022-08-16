SELECT
    repo_id,
    ANY_VALUE(repo_name) AS repo_name,
    COUNT(id) AS cnt,
    DATE_FORMAT(created_at, '%Y-%m-%d %k:00:00') AS event_period
FROM github_events ge
WHERE
    actor_id = 5086433
    AND ((type = 'PullRequestEvent' AND action = 'opened') OR (type = 'IssuesEvent' AND action = 'opened') OR (type = 'IssueCommentEvent' AND action = 'created') OR (type = 'PullRequestReviewEvent' AND action = 'created') OR (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR (type = 'PushEvent' AND action IS NULL))
    AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 28 DAY) AND NOW()) AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
GROUP BY repo_id, event_period
ORDER BY repo_id, event_period DESC
