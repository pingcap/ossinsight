WITH contributions AS (
    SELECT
        actor_login, COUNT(*) AS events
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'IssueCommentEvent' AND action = 'created') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action = '')
        )
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
)
SELECT actor_login, c.events AS events
FROM contributions c
GROUP BY actor_login
ORDER BY c.events DESC
LIMIT 9999999999
