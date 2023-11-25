USE gharchive_dev;

SELECT
    gr.repo_id,
    gr.repo_name,
    COUNT(*) AS contributions,
    DATE_FORMAT(ge.created_at, '%Y-%m-%d %k:00:00') AS event_period
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
    AND
        CASE WHEN ${from} = '' THEN (ge.created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
        ELSE (ge.created_at >= ${from} AND ge.created_at <= ${to})
        END
GROUP BY gr.repo_id, event_period
ORDER BY gr.repo_id, event_period DESC
