USE gharchive_dev;
WITH prs_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT number) AS prs
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = ${collectionId})
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
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = ${collectionId})
        AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
    GROUP BY period, repo_id
), current_period_prs AS (
    SELECT
        repo_id,
        prs,
        ROW_NUMBER() OVER(ORDER BY prs DESC) AS `rank`
    FROM
        prs_group_by_period pgp
    WHERE
        period = 0
), past_period_prs AS (
    SELECT
        repo_id,
        prs,
        ROW_NUMBER() OVER(ORDER BY prs DESC) AS `rank`
    FROM
        prs_group_by_period pgp
    WHERE
        period = 1
)
SELECT
    ci.repo_id,
    ci.repo_name,
    -- Pull Requests
    IFNULL(cpp.prs, 0)                                     AS current_period_total,
    IFNULL(cpp.`rank`, 0)                                  AS current_period_rank,
    IFNULL(ppp.prs, 0)                                     AS past_period_total,
    IFNULL(ppp.`rank`, 0)                                  AS past_period_rank,
    -- The changes of total pull requests between two periods.
    IFNULL(ROUND((cpp.prs - ppp.prs) / ppp.prs * 100, 2), 0) AS total_pop,
    -- The rank changes between two periods.
    IFNULL((cpp.`rank` - ppp.`rank`), 0)                   AS rank_pop,
    -- The total pull requests of repo.
    IFNULL(pgr.prs, 0)                                     AS total
FROM prs_group_by_repo pgr
JOIN collection_items ci ON ci.collection_id = ${collectionId} AND pgr.repo_id = ci.repo_id
JOIN current_period_prs cpp ON pgr.repo_id = cpp.repo_id
LEFT JOIN past_period_prs ppp ON pgr.repo_id = ppp.repo_id
ORDER BY current_period_rank;
