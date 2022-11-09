WITH stars_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(actor_login) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id IN (41986369, 16563587, 105944401)
    GROUP BY repo_id
), stars_group_by_period AS (
    SELECT
        (DATEDIFF(CURRENT_DATE(), event_day)) DIV 28 AS period,
        repo_id,
        ANY_VALUE(repo_name) AS repo_name,
        COUNT(actor_login) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND action = 'started'
        AND repo_id IN (41986369, 16563587, 105944401)
        AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
    GROUP BY period, repo_id
), stars_last_period AS (
    SELECT
        repo_id,
        repo_name,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM
        stars_group_by_period sgp
    WHERE
        period = 0

), stars_last_2nd_period AS (
    SELECT
        repo_id,
        repo_name,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM
        stars_group_by_period sgp
    WHERE
        period = 1
)
SELECT
    slp.repo_id,
    slp.repo_name,
    -- Stars
    IFNULL(slp.stars, 0) AS last_period_total,
    IFNULL(slp.`rank`, 0) AS last_period_rank,
    IFNULL(sl2p.stars, 0) AS last_2nd_period_total,
    IFNULL(sl2p.`rank`, 0) AS last_2nd_period_rank,
    IFNULL(((slp.stars - sl2p.stars) / sl2p.stars) * 100, 0) AS total_pop,
    IFNULL((slp.`rank` - sl2p.`rank`), 0) AS rank_pop,
    IFNULL(pgr.stars, 0) AS total
FROM stars_group_by_repo pgr
JOIN stars_last_period slp ON pgr.repo_id = slp.repo_id
LEFT JOIN stars_last_2nd_period sl2p ON pgr.repo_id = sl2p.repo_id
ORDER BY last_period_rank;
