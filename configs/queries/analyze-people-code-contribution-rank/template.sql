WITH former_contributors AS (
    SELECT DISTINCT actor_login
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PushEvent'
        AND action = ''
        AND created_at < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
), code_contribution_last_month AS (
    SELECT actor_login, COUNT(*) AS events
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PushEvent'
        AND action = ''
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
    ORDER BY events DESC
), code_contribution_last_2nd_month AS (
    SELECT actor_login, COUNT(*) AS events
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND 'PushEvent'
        AND action = ''
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
    ORDER BY events DESC
)
SELECT
    ROW_NUMBER() OVER (ORDER BY lm.events DESC) AS row_num,
    lm.actor_login,
    lm.events AS 'last_month_events',
    COALESCE(l2m.events, 0) AS 'last_2nd_month_events',
    COALESCE(lm.events - l2m.events, 0) AS changes, 
    lm.events / (SELECT COALESCE(SUM(events), 0) FROM code_contribution_last_month) AS proportion,
    CASE WHEN fc.actor_login IS NULL THEN true ELSE false END AS is_new_contributor
FROM code_contribution_last_month lm
LEFT JOIN code_contribution_last_2nd_month l2m ON lm.actor_login = l2m.actor_login
LEFT JOIN former_contributors fc ON lm.actor_login = fc.actor_login
ORDER BY lm.events DESC
LIMIT 50
;