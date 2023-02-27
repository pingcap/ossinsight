WITH acc AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01')                                    AS t_month,
        COUNT(actor_login) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m-01')) AS total,
        ROW_NUMBER() OVER (PARTITION BY actor_login)                           AS row_num
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id = 41986369
)
SELECT t_month AS event_month, total
FROM acc
GROUP BY t_month
ORDER BY t_month
;

