WITH stars_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT actor_login) AS prs
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND action = 'started'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
    GROUP BY repo_id
), stars_group_by_period AS (
    SELECT
        (DATEDIFF(CURRENT_DATE(), DATE(created_at))) DIV 28 AS period,
        repo_id,
        COUNT(DISTINCT actor_login) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND action = 'started'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
        AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
    GROUP BY period, repo_id
), stars_last_period AS (
    SELECT
        repo_id,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM
        stars_group_by_period sgp
    WHERE
        period = 0

), stars_last_2nd_period AS (
    SELECT
        repo_id,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM
        stars_group_by_period sgp
    WHERE
        period = 1
)
SELECT
    ci.repo_id,
    ci.repo_name,
    -- Stars
    IFNULL(slp.stars, 0)                                     AS last_period_total,
    IFNULL(slp.`rank`, 0)                                    AS last_period_rank,
    IFNULL(sl2p.stars, 0)                                    AS last_2nd_period_total,
    IFNULL(sl2p.`rank`, 0)                                   AS last_2nd_period_rank,
    -- The changes of total stars between two periods.
    IFNULL(((slp.stars - sl2p.stars) / sl2p.stars) * 100, 0) AS total_pop,
    -- The rank changes between two periods.
    IFNULL((slp.`rank` - sl2p.`rank`), 0)                    AS rank_pop,
    -- The total stars of repo.
    IFNULL(sgr.prs, 0)                                       AS total
FROM stars_group_by_repo sgr
JOIN collection_items ci ON ci.collection_id = 10001 AND sgr.repo_id = ci.repo_id
JOIN stars_last_period slp ON sgr.repo_id = slp.repo_id
LEFT JOIN stars_last_2nd_period sl2p ON sgr.repo_id = sl2p.repo_id
ORDER BY last_period_rank;
