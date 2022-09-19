WITH acc AS (
    SELECT
        /*+ MERGE() */
        YEAR(created_at) AS event_year,
        repo_id,
        COUNT(number) OVER(PARTITION BY repo_id ORDER BY YEAR(created_at) ASC) AS total
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id IN (41986369, 16563587, 105944401)
    ORDER BY event_year
), acc_dist AS (
    SELECT event_year, repo_id, ANY_VALUE(total) AS total
    FROM acc
    GROUP BY event_year, repo_id
    ORDER BY event_year
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