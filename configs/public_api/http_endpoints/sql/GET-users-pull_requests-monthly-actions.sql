USE gharchive_dev;

WITH user AS (
    SELECT id AS user_id
    FROM github_users
    WHERE login = ${username}
    LIMIT 1
), user_merged_prs AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE
        creator_user_id = (SELECT user_id FROM user)
        AND type = 'PullRequestEvent'
        AND action = 'closed'
        AND pr_merged = true
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY 1
    ORDER BY 1
), user_open_prs AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE
        creator_user_id = (SELECT user_id FROM user)
        AND type = 'PullRequestEvent'
        AND action = 'opened'
        AND pr_merged = false
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY 1
    ORDER BY 1
), event_months AS (
    SELECT
        DISTINCT t_month
    FROM (
        SELECT t_month
        FROM user_open_prs
        UNION
        SELECT event_month
        FROM user_merged_prs
    ) sub
)
SELECT
    m.t_month AS event_month,
    IFNULL(opr.cnt, 0) AS opened_prs,
    IFNULL(mpr.cnt, 0) AS merged_prs
FROM event_months m
LEFT JOIN user_open_prs opr ON m.t_month = opr.t_month
LEFT JOIN user_merged_prs mpr ON m.t_month = mpr.event_month
ORDER BY m.t_month