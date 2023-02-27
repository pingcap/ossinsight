SELECT
    t_month AS event_month, total
FROM (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01')                                   as t_month,
        COUNT(actor_login) OVER(ORDER BY DATE_FORMAT(created_at, '%Y-%m-01')) AS total,
        ROW_NUMBER() OVER(PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01'))   AS row_num
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id = 41986369
    ORDER BY t_month
) acc
WHERE
    row_num = 1
ORDER BY t_month
;