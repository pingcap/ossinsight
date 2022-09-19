SELECT
    /*+ read_from_storage(tikv[r]) */
    event_month, sub.repo_id AS repo_id, r.repo_name AS repo_name, ANY_VALUE(total) AS total
FROM (
    SELECT
        event_month,
        repo_id,
        COUNT(number) OVER(PARTITION BY repo_id ORDER BY event_month) AS total
    FROM (
        SELECT
            DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
            repo_id,
            number
        FROM
            github_events ge
        WHERE
            type = 'IssuesEvent'
            AND repo_id IN (41986369, 16563587, 105944401)
    ) sub
    ORDER BY event_month
) sub
LEFT JOIN github_repos r ON sub.repo_id = r.repo_id
GROUP BY event_month, repo_id
ORDER BY event_month
;