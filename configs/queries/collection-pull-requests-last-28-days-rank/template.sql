WITH prs_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT number) AS prs
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id IN (41986369, 16563587, 105944401)
    GROUP BY repo_id
), prs_group_by_period AS (
    SELECT
        (DATEDIFF(CURRENT_DATE(), event_day)) DIV 28 AS period,
        repo_id,
        ANY_VALUE(repo_name) AS repo_name,
        COUNT(DISTINCT number) AS prs
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id IN (41986369, 16563587, 105944401)
        AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
    GROUP BY period, repo_id
), prs_last_period AS (
    SELECT
        repo_id,
        repo_name,
        prs,
        ROW_NUMBER() OVER(ORDER BY prs DESC) AS `rank`
    FROM
        prs_group_by_period sgp
    WHERE
        period = 0

), prs_last_2nd_period AS (
    SELECT
        repo_id,
        repo_name,
        prs,
        ROW_NUMBER() OVER(ORDER BY prs DESC) AS `rank`
    FROM
        prs_group_by_period sgp
    WHERE
        period = 1
)
SELECT
    plp.repo_id,
    plp.repo_name,
    -- Pull Requests
    IFNULL(plp.prs, 0) AS last_period_total,
    IFNULL(plp.`rank`, 0) AS last_period_rank,
    IFNULL(pl2p.prs, 0) AS last_2nd_period_total,
    IFNULL(pl2p.`rank`, 0) AS last_2nd_period_rank,
    IFNULL(((plp.prs - pl2p.prs) / pl2p.prs) * 100, 0) AS total_pop,
    IFNULL((plp.`rank` - pl2p.`rank`), 0) AS rank_pop,
    IFNULL(pgr.prs, 0) AS total
FROM prs_group_by_repo pgr
JOIN prs_last_period plp ON pgr.repo_id = plp.repo_id
LEFT JOIN prs_last_2nd_period pl2p ON pgr.repo_id = pl2p.repo_id
ORDER BY last_period_rank;
