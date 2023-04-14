WITH accumulative_stars_by_month AS (
    SELECT
        t_month,
        repo_id,
        COUNT(*) OVER (PARTITION BY repo_id ORDER BY t_month) AS total,
        -- De-duplicate by t_month column, keeping only the first accumulative value of each month.
        ROW_NUMBER() OVER (PARTITION BY repo_id, t_month) AS row_num_by_month
    FROM (
        SELECT
            repo_id,
            DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
            -- De-duplicate by actor_login column, keeping only the first event of each star.
            ROW_NUMBER() OVER (PARTITION BY ge.repo_id, actor_login ORDER BY created_at) AS row_num_by_actor_login
        FROM github_events ge
        WHERE
            type = 'WatchEvent'
            AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
    ) sub
    WHERE
        row_num_by_actor_login = 1
)
SELECT
    ci.repo_id AS repo_id,
    ci.repo_name AS repo_name,
    acc.t_month AS event_month,
    acc.total
FROM accumulative_stars_by_month acc
JOIN collection_items ci ON collection_id = 10001 AND ci.repo_id = acc.repo_id
WHERE row_num_by_month = 1
ORDER BY t_month
;
