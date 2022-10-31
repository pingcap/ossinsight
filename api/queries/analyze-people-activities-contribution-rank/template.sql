WITH activity_contribution_last_month AS (
    SELECT actor_login, COUNT(*) AS events
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'IssueCommentEvent' AND action = 'created') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action = '')
        )
    GROUP BY actor_login
    ORDER BY events DESC
), activity_contribution_last_2nd_month AS (
    SELECT actor_login, COUNT(*) AS events
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND event_month = DATE_FORMAT(DATE_SUB(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), INTERVAL 1 MONTH), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'IssueCommentEvent' AND action = 'created') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action = '')
        )
    GROUP BY actor_login
), s AS (
    SELECT COALESCE(SUM(events), 0) AS total FROM activity_contribution_last_month
)
SELECT
    ROW_NUMBER() OVER (ORDER BY lm.events DESC) AS row_num,
    lm.actor_login,
    lm.events AS last_month_events,
    COALESCE(l2m.events, 0) AS last_2nd_month_events,
    COALESCE(lm.events - l2m.events, 0) AS changes, 
    lm.events / s.total AS proportion
FROM s, activity_contribution_last_month lm
LEFT JOIN activity_contribution_last_2nd_month l2m ON lm.actor_login = l2m.actor_login
ORDER BY lm.events DESC
LIMIT 50
;