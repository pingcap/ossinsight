WITH prs_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT number) AS prs
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
    GROUP BY repo_id
), prs_group_by_period AS (
    SELECT
        (DATEDIFF(CURRENT_DATE(), DATE(created_at))) DIV 28 AS period,
        repo_id,
        COUNT(DISTINCT number) AS prs
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
        AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
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
    ci.repo_id,
    ci.repo_name,
    -- Pull Requests
    IFNULL(plp.prs, 0) AS last_period_total,
    IFNULL(plp.`rank`, 0) AS last_period_rank,
    IFNULL(pl2p.prs, 0) AS last_2nd_period_total,
    IFNULL(pl2p.`rank`, 0) AS last_2nd_period_rank,
    -- The changes of total pull requests between two periods.
    IFNULL(((plp.prs - pl2p.prs) / pl2p.prs) * 100, 0) AS total_pop,
    -- The rank changes between two periods.
    IFNULL((plp.`rank` - pl2p.`rank`), 0) AS rank_pop,
    -- The total pull requests of repo.
    IFNULL(pgr.prs, 0) AS total
FROM prs_group_by_repo pgr
JOIN collection_items ci ON ci.collection_id = 10001 AND pgr.repo_id = ci.repo_id
JOIN prs_last_period plp ON pgr.repo_id = plp.repo_id
LEFT JOIN prs_last_2nd_period pl2p ON pgr.repo_id = pl2p.repo_id
ORDER BY last_period_rank;
