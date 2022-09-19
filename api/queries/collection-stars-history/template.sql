WITH acc AS (
    SELECT
        /*+ MERGE() */
        event_month,
        repo_id,
        COUNT(actor_login) OVER(PARTITION BY repo_id ORDER BY event_month ASC) AS total
    FROM github_events ge
    WHERE
        type = 'WatchEvent'
        AND repo_id IN (41986369, 16563587, 105944401)
    ORDER BY event_month
)
SELECT
    /*+ read_from_storage(tikv[r]) */
    event_month, acc.repo_id AS repo_id, ANY_VALUE(r.repo_name) AS repo_name, total
FROM acc
LEFT JOIN github_repos r ON acc.repo_id = r.repo_id
GROUP BY event_month, acc.repo_id
ORDER BY event_month
;