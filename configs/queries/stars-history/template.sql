WITH acc AS (
    SELECT
        event_month,
        repo_name,
        COUNT(actor_login) OVER(PARTITION BY repo_name ORDER BY event_month ASC) AS total
    FROM (
        SELECT
            event_month,
            actor_login,
            FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
            ROW_NUMBER() OVER(PARTITION BY actor_login) AS row_num
        FROM github_events
        WHERE
            type = 'WatchEvent' AND repo_id = 41986369
    ) prs_with_latest_repo_name
    WHERE row_num = 1
    ORDER BY 1
)
SELECT event_month, ANY_VALUE(repo_name) AS repo_name, ANY_VALUE(total) AS total
FROM acc
GROUP BY 1
ORDER BY 1
;