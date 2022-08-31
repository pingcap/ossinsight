SELECT
    event_month, repo_id, total
FROM (
    SELECT
        event_month,
        repo_id,
        COUNT(actor_login) OVER(ORDER BY event_month ASC) AS total,
        ROW_NUMBER() OVER(PARTITION BY event_month) AS row_num
    FROM github_events
    WHERE
        type = 'WatchEvent' AND repo_id = 41986369
    ORDER BY event_month
) acc
WHERE
    row_num = 1
ORDER BY event_month
;