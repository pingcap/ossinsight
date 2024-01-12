WITH issue_contribution_last_month AS (
    SELECT actor_login, COUNT(*) AS comments
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssueCommentEvent'
        AND action = 'created'
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
), issue_contribution_last_2nd_month AS (
    SELECT actor_login, COUNT(*) AS comments
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssueCommentEvent'
        AND action = 'created'
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
), s AS (
    SELECT COALESCE(SUM(comments), 0) AS total FROM issue_contribution_last_month
)
SELECT
    ROW_NUMBER() OVER (ORDER BY lm.comments DESC) AS row_num,
    lm.actor_login,
    lm.comments AS 'last_month_events',
    COALESCE(l2m.comments, 0) AS 'last_2nd_month_events',
    COALESCE(lm.comments - l2m.comments, 0) AS changes, 
    lm.comments / s.total AS proportion
FROM issue_contribution_last_month lm
JOIN s ON 1 = 1
LEFT JOIN issue_contribution_last_2nd_month l2m ON lm.actor_login = l2m.actor_login
ORDER BY lm.comments DESC
LIMIT 50
;