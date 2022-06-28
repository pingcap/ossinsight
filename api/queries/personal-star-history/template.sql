WITH star_repos AS (
    SELECT repo_id, ANY_VALUE(repo_name) AS repo_name, ANY_VALUE(last_stared_at) AS star_month
    FROM (
        SELECT
            repo_id,
            FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
            FIRST_VALUE(event_month) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS last_stared_at
        FROM github_events ge
        WHERE
            actor_id = 5086433 AND type = 'WatchEvent'
    ) sub
    GROUP BY repo_id
), repo_with_language AS (
    SELECT repo_id, ANY_VALUE(language) AS language
    FROM (
        SELECT
            ge.repo_id,
            FIRST_VALUE(language) OVER (PARTITION BY ge.repo_id ORDER BY created_at DESC) AS language
        FROM github_events ge
        JOIN star_repos sr ON ge.repo_id = sr.repo_id
        WHERE
            type = 'PullRequestEvent'
   ) sub
   GROUP BY repo_id 
), star_repos_count_by_month AS (
    SELECT
        sr.star_month,
        COUNT(DISTINCT repo_id) AS month_cnt
    FROM star_repos sr
    GROUP BY star_month
    ORDER BY star_month
)
SELECT
    sr.star_month,
    IFNULL(rl.language, 'Unknown') AS language,
    COUNT(sr.repo_id) AS cnt,
    COUNT(sr.repo_id) / m.month_cnt AS percentage
FROM star_repos sr
JOIN star_repos_count_by_month m ON sr.star_month = m.star_month
LEFT JOIN repo_with_language rl ON sr.repo_id = rl.repo_id
GROUP BY star_month, language
ORDER BY star_month, language;