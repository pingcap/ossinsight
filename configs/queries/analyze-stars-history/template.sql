WITH stars AS (
    SELECT
        repo_id,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY repo_id, actor_login) AS row_num
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id IN (41986369)
), stars_per_month AS (
    SELECT
        repo_id,
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        COUNT(*) AS total
    FROM stars
    WHERE
        row_num = 1
    GROUP BY
        repo_id, t_month
), acc AS (
    SELECT
        repo_id,
        t_month,
        SUM(total) OVER (PARTITION BY repo_id ORDER BY t_month) AS total,
        ROW_NUMBER() OVER(PARTITION BY repo_id, t_month) AS row_num
    FROM
        stars_per_month
)
SELECT
    repo_id,
    t_month AS event_month,
    total
FROM acc
WHERE row_num = 1
ORDER BY t_month
;