WITH stars AS (
    SELECT
        created_at,
        ROW_NUMBER() OVER (PARTITION BY actor_login) AS row_num
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id = 41986369
), stars_per_month AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        COUNT(*) AS total
    FROM stars
    WHERE
        row_num = 1
    GROUP BY
        t_month
), acc AS (
    SELECT
        t_month,
        SUM(total) OVER (ORDER BY t_month) AS total
    FROM stars_per_month
)
SELECT
    t_month AS event_month,
    total
FROM acc
GROUP BY t_month
ORDER BY t_month
;