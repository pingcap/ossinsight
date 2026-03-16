USE gharchive_dev;

WITH repo AS (
    SELECT repo_id
    FROM github_repos
    WHERE repo_name = CONCAT(${owner}, '/', ${repo})
    LIMIT 1
), past_period_activities AS (
    SELECT
        actor_login,
        COUNT(*) AS activities
    FROM github_events ge
    WHERE
        repo_id = (SELECT repo_id FROM repo)
        AND CASE
            WHEN ${period} = 'past_month' THEN (
                created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
                AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
            )
            ELSE (
                created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
            )
        END
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
    ORDER BY activities DESC
), past_2nd_period_activities AS (
    SELECT
        actor_login,
        COUNT(*) AS activities
    FROM github_events ge
    WHERE
        repo_id = (SELECT repo_id FROM repo)
        AND CASE
            WHEN ${period} = 'past_month' THEN (
                created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01') AND
                created_at < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
            )
            ELSE (
                created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY) AND
                created_at < DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
            )
        END
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
    SELECT COALESCE(SUM(activities), 0) AS total FROM past_period_activities
)
SELECT
    ROW_NUMBER() OVER (ORDER BY pp.activities DESC) AS `rank`,
    pp.actor_login AS username,
    pp.activities AS past_period_activities,
    COALESCE(p2p.activities, 0) AS past_2nd_period_activities, 
    pp.activities / s.total AS proportion
FROM s, past_period_activities pp
LEFT JOIN past_2nd_period_activities p2p ON pp.actor_login = p2p.actor_login
ORDER BY  pp.activities DESC
LIMIT ${n}
;