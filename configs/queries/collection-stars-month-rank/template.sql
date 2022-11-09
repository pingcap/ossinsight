WITH stars_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(actor_login) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id IN (41986369, 16563587, 105944401)
    GROUP BY repo_id
), stars_group_by_month AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
        repo_id,
        COUNT(actor_login) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND action = 'started'
        AND repo_id IN (41986369, 16563587, 105944401)
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
    GROUP BY repo_id, DATE_FORMAT(created_at, '%Y-%m-01')
), stars_last_month AS (
    SELECT
        repo_id,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM stars_group_by_month
    WHERE
        event_month = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
), stars_last_2nd_month AS (
    SELECT
        repo_id,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM stars_group_by_month
    WHERE
        event_month = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
)
SELECT
    sgr.repo_id,
    r.repo_name,
    DATE_FORMAT(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), '%Y-%m') AS current_month,
    DATE_FORMAT(DATE_SUB(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), INTERVAL 1 MONTH), '%Y-%m') AS last_month,
    -- Stars
    slm.stars AS current_month_total,
    slm.`rank` AS current_month_rank,
    IFNULL(sl2m.stars, 0) AS last_month_total,
    sl2m.`rank` AS last_month_rank,
    ((slm.stars - sl2m.stars) / sl2m.stars) * 100 AS total_mom,
    (slm.`rank` - sl2m.`rank`) AS rank_mom,
    sgr.stars AS total
FROM stars_group_by_repo sgr 
JOIN stars_last_month slm ON sgr.repo_id = slm.repo_id
LEFT JOIN stars_last_2nd_month sl2m ON slm.repo_id = sl2m.repo_id
LEFT JOIN github_repos r ON sgr.repo_id = r.repo_id
ORDER BY current_month_rank;