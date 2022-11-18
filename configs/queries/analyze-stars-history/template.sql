SELECT
    event_month, repo_id, total
FROM (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') as event_month,
        repo_id,
        COUNT(actor_login) OVER(ORDER BY DATE_FORMAT(created_at, '%Y-%m-01') ASC) AS total,
        ROW_NUMBER() OVER(PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01')) AS row_num
    FROM github_events
    WHERE
        type = 'WatchEvent' AND repo_id = 41986369
    ORDER BY event_month
) acc
WHERE
    row_num = 1
ORDER BY event_month
;