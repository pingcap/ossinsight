WITH acc AS (
    SELECT
        YEAR(created_at) AS t_year,
        repo_id,
        COUNT(*) OVER(PARTITION BY repo_id ORDER BY YEAR(created_at)) AS total,
        ROW_NUMBER() OVER(PARTITION BY repo_id, YEAR(created_at) ORDER BY created_at) AS row_num
    FROM github_events ge
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001 LIMIT 200)
        -- Exclude Bots
        AND actor_login NOT LIKE '%bot%'
        AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
), acc_group_by_year AS (
    SELECT repo_id, t_year, total
    FROM acc
    WHERE row_num = 1
    GROUP BY repo_id, t_year
    ORDER BY t_year
)
SELECT
    t_year AS event_year,
    gr.repo_id AS repo_id,
    gr.repo_name AS repo_name,
    total,
    ROW_NUMBER() OVER (PARTITION BY t_year ORDER BY total DESC) AS `rank`
FROM acc_group_by_year acc
LEFT JOIN github_repos gr ON acc.repo_id = gr.repo_id
WHERE acc.repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001 LIMIT 200)
ORDER BY t_year, total DESC
;