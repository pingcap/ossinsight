USE gharchive_dev;
WITH stars_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT actor_login) AS prs
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND action = 'started'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = ${collection_id})
    GROUP BY repo_id
), stars_group_by_period AS (
    SELECT
        CASE
          WHEN ${period} = 'past_month' THEN TIMESTAMPDIFF(MONTH, DATE(created_at), CURRENT_DATE())
          ELSE DATEDIFF(CURRENT_DATE(), DATE(created_at)) DIV 28
        END AS period,
        repo_id,
        COUNT(DISTINCT actor_login) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND action = 'started'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = ${collection_id})
        AND CASE
          WHEN ${period} = 'past_month' THEN created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH)
          ELSE created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
        END
    GROUP BY period, repo_id
), current_period_stars AS (
    SELECT
        repo_id,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM
        stars_group_by_period sgp
    WHERE
        period = 0

), past_period_stars AS (
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
    IFNULL(cps.stars, 0)                                   AS current_period_growth,
    IFNULL(cps.`rank`, 0)                                  AS current_period_rank,
    IFNULL(pps.stars, 0)                                   AS past_period_growth,
    IFNULL(pps.`rank`, 0)                                  AS past_period_rank,
    -- The changes of total stars between two periods.
    IFNULL(ROUND((cps.stars - pps.stars) / pps.stars * 100, 2), 0) AS growth_pop,
    -- The rank changes between two periods.
    IFNULL((cps.`rank` - pps.`rank`), 0)                   AS rank_pop,
    -- The total stars of repo.
    IFNULL(sgr.prs, 0)                                     AS total
FROM stars_group_by_repo sgr
JOIN collection_items ci ON ci.collection_id = ${collection_id} AND sgr.repo_id = ci.repo_id
JOIN current_period_stars cps ON sgr.repo_id = cps.repo_id
LEFT JOIN past_period_stars pps ON sgr.repo_id = pps.repo_id
ORDER BY current_period_rank;
