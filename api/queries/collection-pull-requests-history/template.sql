WITH acc AS (
    SELECT
        /*+ MERGE() */
        event_month,
        repo_id,
        COUNT(number) OVER(PARTITION BY repo_id ORDER BY event_month ASC) AS total
    FROM (
        SELECT
            DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
            repo_id,
            number
        FROM github_events
        WHERE
            type = 'PullRequestEvent'
            AND action = 'opened'
            AND repo_id IN (41986369, 16563587, 105944401)
    ) sub
    ORDER BY event_month
)
SELECT
    /*+ read_from_storage(tikv[r]) */
    event_month, acc.repo_id AS repo_id, ANY_VALUE(r.repo_name) AS repo_name, ANY_VALUE(total) AS total
FROM acc
LEFT JOIN github_repos r ON acc.repo_id = r.repo_id
GROUP BY event_month, acc.repo_id
ORDER BY event_month
;