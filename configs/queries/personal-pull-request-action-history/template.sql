WITH user_merged_prs AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE
        creator_user_id = 5086433
        AND type = 'PullRequestEvent'
        AND action = 'closed'
        AND pr_merged = true
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
    GROUP BY 1
    ORDER BY 1
), user_open_prs AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE
        creator_user_id = 5086433
        AND type = 'PullRequestEvent'
        AND action = 'opened'
        AND pr_merged = false
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
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