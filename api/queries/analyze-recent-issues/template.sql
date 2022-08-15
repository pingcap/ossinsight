WITH RECURSIVE seq(idx) AS (
      SELECT 1 AS idx
      UNION ALL
      SELECT idx + 1 AS idx
      FROM seq
      WHERE idx < 28
), opened_issues_group_by_day AS (
    SELECT
        day_offset % 28 + 1 AS idx,
        day_offset DIV 28 AS period,
        day,
        issues
    FROM (
        SELECT
            (DATEDIFF(CURRENT_DATE(), day)) AS day_offset,
            day,
            issues
        FROM (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
                COUNT(*) AS issues
            FROM
                github_events ge
            WHERE
                type = 'PullRequestEvent'
                AND action = 'opened'
                AND repo_id = 41986369
                AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
                AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
            GROUP BY day
            ORDER BY day
        ) sub
    ) sub2
), closed_issues_group_by_day AS (
    SELECT
        day_offset % 28 + 1 AS idx,
        day_offset DIV 28 AS period,
        day,
        issues
    FROM (
        SELECT
            (DATEDIFF(CURRENT_DATE(), day)) AS day_offset,
            day,
            issues
        FROM (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
                COUNT(*) AS issues
            FROM
                github_events ge
            WHERE
                type = 'PullRequestEvent'
                AND action = 'closed'
                AND pr_merged = true
                AND repo_id = 41986369
                AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
                AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
            GROUP BY day
            ORDER BY day
        ) sub
    ) sub2
), opened_issues_last_28_days AS (
    SELECT idx, day, issues
    FROM opened_issues_group_by_day
    WHERE period = 0
), opened_issues_last_2nd_28_days AS (
    SELECT idx, day, issues
    FROM opened_issues_group_by_day
    WHERE period = 1
), closed_issues_last_28_days AS (
    SELECT idx, day, issues
    FROM closed_issues_group_by_day
    WHERE period = 0
), closed_issues_last_2nd_28_days AS (
    SELECT idx, day, issues
    FROM closed_issues_group_by_day
    WHERE period = 1
), opened_issues_last_28_days_total AS (
    SELECT SUM(issues) AS total FROM opened_issues_last_28_days
), opened_issues_last_2nd_28_days_total AS (
    SELECT SUM(issues) AS total FROM opened_issues_last_2nd_28_days
), closed_issues_last_28_days_total AS (
    SELECT SUM(issues) AS total FROM closed_issues_last_28_days
), closed_issues_last_2nd_28_days_total AS (
    SELECT SUM(issues) AS total FROM closed_issues_last_2nd_28_days
)
SELECT
    s.idx AS idx,
    COALESCE(oicp.day, cicp.day) AS current_period_day,
    IFNULL(oicp.issues, 0) AS current_period_opened_day_issues,
    IFNULL(oicpt.total, 0) AS current_period_opened_issues,
    IFNULL(oilp.issues, 0) AS last_period_opened_day_issues,
    IFNULL(oilpt.total, 0) AS last_period_opened_issues,
    COALESCE(oilp.day, cilp.day) AS last_period_day,
    IFNULL(cicp.issues, 0) AS current_period_closed_day_issues,
    IFNULL(cicpt.total, 0) AS current_period_closed_issues,
    IFNULL(cilp.issues, 0) AS last_period_closed_day_issues,
    IFNULL(cilpt.total, 0) AS last_period_closed_issues
FROM seq s
LEFT JOIN opened_issues_last_28_days oicp ON s.idx = oicp.idx
LEFT JOIN opened_issues_last_2nd_28_days oilp ON s.idx = oilp.idx
LEFT JOIN closed_issues_last_28_days cicp ON s.idx = cicp.idx
LEFT JOIN closed_issues_last_2nd_28_days cilp ON s.idx = cilp.idx
JOIN opened_issues_last_28_days_total oicpt ON 1 = 1
JOIN opened_issues_last_2nd_28_days_total oilpt ON 1 = 1
JOIN closed_issues_last_28_days_total cicpt ON 1 = 1
JOIN closed_issues_last_2nd_28_days_total cilpt ON 1 = 1
ORDER BY idx
;