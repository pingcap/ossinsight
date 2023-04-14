SELECT
    t_month AS event_month,
    repo_id,
    total
FROM (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        repo_id,
        COUNT(actor_login) OVER(ORDER BY repo_id, DATE_FORMAT(created_at, '%Y-%m-01')) AS total,
        ROW_NUMBER() OVER(PARTITION BY repo_id, DATE_FORMAT(created_at, '%Y-%m-01')) AS row_num
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id = (41986369)
    ORDER BY t_month
) acc
WHERE
    row_num = 1
ORDER BY t_month
;