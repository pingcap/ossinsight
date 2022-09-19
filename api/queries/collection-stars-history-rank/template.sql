WITH acc AS (
    SELECT
        YEAR(event_month) AS event_year,
        repo_id,
        COUNT(actor_login) OVER(PARTITION BY repo_id ORDER BY YEAR(event_month) ASC) AS total
    FROM github_events
    WHERE
        type = 'WatchEvent'
        AND repo_id IN (41986369, 16563587, 105944401)
), acc_dist AS (
    SELECT event_year, repo_id, ANY_VALUE(total) AS total
    FROM acc
    GROUP BY 1, 2
    ORDER BY 1
)
SELECT
    event_year,
    acc_dist.repo_id AS repo_id,
    r.repo_name AS repo_name,
    total,
    ROW_NUMBER() OVER (PARTITION BY event_year ORDER BY total DESC) AS `rank`
FROM acc_dist
LEFT JOIN github_repos r ON acc_dist.repo_id = r.repo_id
ORDER BY event_year, total DESC
;