WITH prs_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(number) AS prs
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id IN (41986369, 16563587, 105944401)
    GROUP BY repo_id
), prs_group_by_period AS (
    SELECT
        (DATEDIFF(NOW(), created_at)) DIV 28 AS period,
        repo_id,
        COUNT(number) AS prs
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id IN (41986369, 16563587, 105944401)
        AND created_at > DATE_SUB(NOW(), INTERVAL 56 DAY)
    GROUP BY period, repo_id
), prs_last_period AS (
    SELECT
        repo_id,
        prs,
        ROW_NUMBER() OVER(ORDER BY prs DESC) AS `rank`
    FROM
        prs_group_by_period sgp
    WHERE
        period = 0

), prs_last_2nd_period AS (
    SELECT
        repo_id,
        prs,
        ROW_NUMBER() OVER(ORDER BY prs DESC) AS `rank`
    FROM
        prs_group_by_period sgp
    WHERE
        period = 1
)
SELECT
    plp.repo_id,
    r.repo_name,
    -- Pull Requests
    IFNULL(plp.prs, 0) AS last_period_total,
    IFNULL(plp.`rank`, 0) AS last_period_rank,
    IFNULL(pl2p.prs, 0) AS last_2nd_period_total,
    IFNULL(pl2p.`rank`, 0) AS last_2nd_period_rank,
    IFNULL(((plp.prs - pl2p.prs) / pl2p.prs) * 100, 0) AS total_pop,
    IFNULL((plp.`rank` - pl2p.`rank`), 0) AS rank_pop,
    IFNULL(pgr.prs, 0) AS total
FROM prs_group_by_repo pgr
LEFT JOIN github_repos r ON pgr.repo_id = r.repo_id
LEFT JOIN prs_last_period plp ON pgr.repo_id = plp.repo_id
LEFT JOIN prs_last_2nd_period pl2p ON pgr.repo_id = pl2p.repo_id
ORDER BY last_period_rank;
