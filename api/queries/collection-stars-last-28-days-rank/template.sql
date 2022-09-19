WITH stars_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT actor_login) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id IN (41986369, 16563587, 105944401)
    GROUP BY repo_id
), stars_group_by_period AS (
    SELECT
        (DATEDIFF(NOW(), created_at)) DIV 28 AS period,
        repo_id,
        COUNT(1) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND action = 'started'
        AND repo_id IN (41986369, 16563587, 105944401)
        AND created_at > DATE_SUB(NOW(), INTERVAL 56 DAY)
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
    slp.repo_id,
    r.repo_name,
    -- Stars
    IFNULL(slp.stars, 0) AS last_period_total,
    IFNULL(slp.`rank`, 0) AS last_period_rank,
    IFNULL(sl2p.stars, 0) AS last_2nd_period_total,
    IFNULL(sl2p.`rank`, 0) AS last_2nd_period_rank,
    IFNULL(((slp.stars - sl2p.stars) / sl2p.stars) * 100, 0) AS total_pop,
    IFNULL((slp.`rank` - sl2p.`rank`), 0) AS rank_pop,
    IFNULL(sgr.stars, 0) AS total
FROM stars_group_by_repo sgr
LEFT JOIN github_repos r ON sgr.repo_id = r.repo_id
LEFT JOIN stars_last_period slp ON sgr.repo_id = slp.repo_id
LEFT JOIN stars_last_2nd_period sl2p ON sgr.repo_id = sl2p.repo_id
ORDER BY last_period_rank;
