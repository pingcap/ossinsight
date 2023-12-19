USE gharchive_dev;

SELECT
    gr.repo_id,
    gr.repo_name,
    COUNT(*) AS contributions,
    DATE_FORMAT(ge.created_at, '%Y-%m-%d %k:00:00') AS event_hour
FROM github_events ge
JOIN github_repos gr ON ge.repo_id = gr.repo_id
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
GROUP BY gr.repo_id, event_hour
ORDER BY gr.repo_id, event_hour DESC
