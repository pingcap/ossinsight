WITH stars_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT actor_login) AS stars
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id IN (41986369, 16563587, 105944401)
    GROUP BY repo_id
), m AS (
    SELECT
        DATE_FORMAT(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), '%Y-%m-01') AS `month`
    UNION
    SELECT
        DATE_FORMAT(DATE_SUB(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), INTERVAL 1 MONTH), '%Y-%m-01') AS `month`
), stars_group_by_month AS (
    SELECT
            event_month,
            repo_id,
            ANY_VALUE(repo_name) AS repo_name,
            COUNT(DISTINCT actor_login) AS stars
        FROM github_events
        WHERE
            type = 'WatchEvent'
            AND repo_id IN (41986369, 16563587, 105944401)
            AND event_month IN (SELECT `month` FROM m)
        GROUP BY repo_id, event_month
), stars_last_month AS (
    SELECT
        repo_id,
        repo_name,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM stars_group_by_month
    WHERE
        event_month = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), '%Y-%m-01')
), stars_last_2nd_month AS (
    SELECT
        repo_id,
        repo_name,
        stars,
        ROW_NUMBER() OVER(ORDER BY stars DESC) AS `rank`
    FROM stars_group_by_month
    WHERE
        event_month = DATE_FORMAT(DATE_SUB(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), INTERVAL 1 MONTH), '%Y-%m-01')
)
SELECT
    sgr.repo_id,
    slm.repo_name,
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
ORDER BY current_month_rank;