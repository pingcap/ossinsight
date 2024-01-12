WITH review_contribution_last_month AS (
    SELECT
        actor_id,
        ANY_VALUE(actor_login) AS actor_login,
        COUNT(*) AS reviews
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestReviewEvent'
        AND action = 'created'
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_id
), review_contribution_last_2nd_month AS (
    SELECT
        actor_id,
        ANY_VALUE(actor_login) AS actor_login,
        COUNT(*) AS reviews
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestReviewEvent'
        AND action = 'created'
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_id
)
SELECT
    lm.actor_id,
    lm.actor_login,
    -- prs reviews
    ROW_NUMBER() OVER (ORDER BY lm.reviews DESC) AS row_num,
    lm.reviews AS last_month_events,
    COALESCE(l2m.reviews, 0) AS last_2nd_month_events,
    COALESCE(lm.reviews - l2m.reviews, 0) AS changes, 
    lm.reviews / (SELECT COALESCE(SUM(reviews), 0) FROM review_contribution_last_month) AS proportion
FROM review_contribution_last_month lm
LEFT JOIN review_contribution_last_2nd_month l2m ON lm.actor_id = l2m.actor_id
ORDER BY lm.reviews DESC
LIMIT 50
;