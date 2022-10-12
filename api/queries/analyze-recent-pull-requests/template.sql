WITH RECURSIVE seq(idx, current_period_day, last_period_day) AS (
      SELECT
        1 AS idx,
        CURRENT_DATE() AS current_period_day,
        DATE_SUB(CURRENT_DATE(), INTERVAL 28 day) AS last_period_day
      UNION ALL
      SELECT
        idx + 1 AS idx,
        DATE_SUB(CURRENT_DATE(), INTERVAL idx + 1 day) AS current_period_day,
        DATE_SUB(CURRENT_DATE(), INTERVAL idx + 1 + 28 day) AS last_period_day
      FROM seq
      WHERE idx < 28
), opened_prs_group_by_day AS (
    SELECT
        day_offset % 28 + 1 AS idx,
        day_offset DIV 28 AS period,
        day,
        prs
    FROM (
        SELECT
            (DATEDIFF(CURRENT_DATE(), day)) AS day_offset,
            day,
            prs
        FROM (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
                COUNT(*) AS prs
            FROM
                github_events ge
            WHERE
                type = 'PullRequestEvent'
                AND action = 'opened'
                AND repo_id = 41986369
                AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
            GROUP BY day
            ORDER BY day
        ) sub
    ) sub2
), merged_prs_group_by_day AS (
    SELECT
        day_offset % 28 + 1 AS idx,
        day_offset DIV 28 AS period,
        day,
        prs
    FROM (
        SELECT
            (DATEDIFF(CURRENT_DATE(), day)) AS day_offset,
            day,
            prs
        FROM (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
                COUNT(*) AS prs
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
), opened_prs_last_28_days AS (
    SELECT idx, day, prs
    FROM opened_prs_group_by_day
    WHERE period = 0
), opened_prs_last_2nd_28_days AS (
    SELECT idx, day, prs
    FROM opened_prs_group_by_day
    WHERE period = 1
), merged_prs_last_28_days AS (
    SELECT idx, day, prs
    FROM merged_prs_group_by_day
    WHERE period = 0
), merged_prs_last_2nd_28_days AS (
    SELECT idx, day, prs
    FROM merged_prs_group_by_day
    WHERE period = 1
), opened_prs_last_28_days_total AS (
    SELECT SUM(prs) AS total FROM opened_prs_last_28_days
), opened_prs_last_2nd_28_days_total AS (
    SELECT SUM(prs) AS total FROM opened_prs_last_2nd_28_days
), merged_prs_last_28_days_total AS (
    SELECT SUM(prs) AS total FROM merged_prs_last_28_days
), merged_prs_last_2nd_28_days_total AS (
    SELECT SUM(prs) AS total FROM merged_prs_last_2nd_28_days
)
SELECT
    s.idx AS idx,
    s.current_period_day AS current_period_day,
    IFNULL(opcp.prs, 0) AS current_period_opened_day_prs,
    IFNULL(opcpt.total, 0) AS current_period_opened_prs,
    IFNULL(oplp.prs, 0) AS last_period_opened_day_prs,
    IFNULL(oplpt.total, 0) AS last_period_opened_prs,
    s.last_period_day AS last_period_day,
    IFNULL(mpcp.prs, 0) AS current_period_merged_day_prs,
    IFNULL(mpcpt.total, 0) AS current_period_merged_prs,
    IFNULL(mplp.prs, 0) AS last_period_merged_day_prs,
    IFNULL(mplpt.total, 0) AS last_period_merged_prs
FROM seq s
LEFT JOIN opened_prs_last_28_days opcp ON s.idx = opcp.idx
LEFT JOIN opened_prs_last_2nd_28_days oplp ON s.idx = oplp.idx
LEFT JOIN merged_prs_last_28_days mpcp ON s.idx = mpcp.idx
LEFT JOIN merged_prs_last_2nd_28_days mplp ON s.idx = mplp.idx
JOIN opened_prs_last_28_days_total opcpt ON 1 = 1
JOIN opened_prs_last_2nd_28_days_total oplpt ON 1 = 1
JOIN merged_prs_last_28_days_total mpcpt ON 1 = 1
JOIN merged_prs_last_2nd_28_days_total mplpt ON 1 = 1
ORDER BY idx