WITH acc AS (
    SELECT
        event_year,
        repo_name,
        COUNT(number) OVER(PARTITION BY repo_name ORDER BY event_year ASC) AS total
    FROM (
        SELECT
            event_year,
            number,
            FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
            ROW_NUMBER() OVER(PARTITION BY number) AS row_num
        FROM github_events
        WHERE
            type = 'PullRequestEvent'
            AND state = 'open'
            AND repo_id IN (41986369, 16563587, 105944401)
            -- Exclude Bots
            AND actor_login NOT LIKE '%bot%'
            AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    ) pr_with_latest_repo_name
    WHERE row_num = 1
    ORDER BY 1
), acc_dist AS (
    SELECT event_year, repo_name, ANY_VALUE(total) AS total
    FROM acc
    GROUP BY 1, 2
    ORDER BY 1
)
SELECT
    event_year,
    repo_name,
    total,
    ROW_NUMBER() OVER (PARTITION BY event_year ORDER BY total DESC) AS `rank`
FROM acc_dist
ORDER BY event_year, total DESC
;