WITH RECURSIVE seq(idx, current_period_day, last_period_day) AS (
      SELECT
        1 AS idx,
        CURRENT_DATE() AS current_period_day,
        DATE_SUB(CURRENT_DATE(), INTERVAL 28 day) AS last_period_day
      UNION ALL
      SELECT
        idx + 1 AS idx,
        DATE_SUB(CURRENT_DATE(), INTERVAL idx day) AS current_period_day,
        DATE_SUB(CURRENT_DATE(), INTERVAL idx + 28 day) AS last_period_day
      FROM seq
      WHERE idx < 28
), group_by_day AS (
    SELECT
        day_offset % 28 + 1 AS idx,
        day_offset DIV 28 AS period,
        day,
        contributors
    FROM (
        SELECT
            (DATEDIFF(CURRENT_DATE(), day)) AS day_offset,
            day,
            contributors
        FROM (
            SELECT
                DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
                COUNT(DISTINCT actor_id) AS contributors
            FROM
                github_events ge
            WHERE
                repo_id = 41986369
                AND (
                    (type = 'PullRequestEvent' AND action = 'opened') OR
                    (type = 'IssuesEvent' AND action = 'opened') OR
                    (type = 'IssueCommentEvent' AND action = 'created') OR
                    (type = 'PullRequestReviewEvent' AND action = 'created') OR
                    (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
                    (type = 'PushEvent' AND action = '')
                )
                AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
            GROUP BY day
            ORDER BY day
        ) sub
    ) sub2
), group_by_period AS (
    SELECT
        (DATEDIFF(CURRENT_DATE(), created_at)) DIV 28 AS period,
        COUNT(DISTINCT actor_id) AS contributors
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'IssueCommentEvent' AND action = 'created') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action = '')
        )
        AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
    GROUP BY period
    ORDER BY period
), last_28_days AS (
    SELECT idx, day, contributors
    FROM group_by_day
    WHERE period = 0
), last_2nd_28_days AS (
    SELECT idx, day, contributors
    FROM group_by_day
    WHERE period = 1
), last_28_days_total AS (
    SELECT contributors AS total FROM group_by_period WHERE period = 0
), last_2nd_28_days_total AS (
    SELECT contributors AS total FROM group_by_period WHERE period = 1
)
SELECT
    s.idx AS idx,
    s.current_period_day AS current_period_day,
    IFNULL(cp.contributors, 0) AS current_period_day_contributors,
    IFNULL(cpt.total, 0) AS current_period_contributors,
    s.last_period_day AS last_period_day,
    IFNULL(lp.contributors, 0) AS last_period_day_contributors,
    IFNULL(lpt.total, 0) AS last_period_contributors
FROM seq s
LEFT JOIN last_28_days cp ON s.idx = cp.idx
LEFT JOIN last_2nd_28_days lp ON s.idx = lp.idx
JOIN last_28_days_total cpt
JOIN last_2nd_28_days_total lpt
ORDER BY idx
;