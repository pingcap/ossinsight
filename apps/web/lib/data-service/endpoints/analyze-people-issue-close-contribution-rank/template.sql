WITH issue_contribution_last_month AS (
    SELECT actor_id, ANY_VALUE(actor_login) AS actor_login, COUNT(*) AS closes
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
        AND action = 'closed'
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_id
), issue_contribution_last_2nd_month AS (
    SELECT actor_id, ANY_VALUE(actor_login) AS actor_login, COUNT(*) AS closes
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
        AND action = 'closed'
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_id
)
SELECT
    ROW_NUMBER() OVER (ORDER BY lm.closes DESC) AS row_num,
    lm.actor_id,
    lm.actor_login,
    lm.closes AS last_month_events,
    COALESCE(l2m.closes, 0) AS last_2nd_month_events,
    COALESCE(lm.closes - l2m.closes, 0) AS changes, 
    lm.closes / (SELECT COALESCE(SUM(closes), 0) FROM issue_contribution_last_month) AS proportion
FROM issue_contribution_last_month lm
LEFT JOIN issue_contribution_last_2nd_month l2m ON lm.actor_id = l2m.actor_id
ORDER BY lm.closes DESC
LIMIT 50
;