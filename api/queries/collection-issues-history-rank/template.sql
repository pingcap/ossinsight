WITH acc AS (
    SELECT
        /*+ MERGE() */
        event_year,
        repo_id,
        COUNT(number) OVER(PARTITION BY repo_id ORDER BY event_year ASC) AS total
    FROM (
        SELECT
            YEAR(created_at) AS event_year,
            repo_id,
            number
        FROM github_events
        WHERE
            type = 'PullRequestEvent'
            AND action = 'opened'
            AND repo_id IN (41986369, 16563587, 105944401)
    ) sub
    ORDER BY event_year
), acc_dist AS (
    SELECT event_year, repo_id, ANY_VALUE(total) AS total
    FROM acc
    GROUP BY event_year, repo_id
    ORDER BY event_year
)
SELECT
    event_year,
    r.repo_name,
    total,
    ROW_NUMBER() OVER (PARTITION BY event_year ORDER BY total DESC) AS `rank`
FROM acc_dist ad
LEFT JOIN github_repos r ON ad.repo_id = r.repo_id
ORDER BY event_year, total DESC
;