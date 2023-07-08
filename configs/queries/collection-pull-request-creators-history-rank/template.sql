WITH accumulative_prs_by_year AS (
    SELECT
        t_year,
        repo_id,
        COUNT(*) OVER (PARTITION BY repo_id ORDER BY t_year) AS total,
        -- De-duplicate by `t_month` column, keeping only the first accumulative value of each year.
        ROW_NUMBER() OVER (PARTITION BY repo_id, t_year) AS row_num_by_year
    FROM (
        SELECT
            repo_id,
            YEAR(created_at) AS t_year,
            -- De-duplicate by `actor_login` column, keeping only the first PR of each PR creator.
            ROW_NUMBER() OVER (PARTITION BY repo_id, actor_login ORDER BY created_at) AS row_num_by_actor_login
        FROM github_events ge
        WHERE
            type = 'PullRequestEvent'
            AND action = 'opened'
            AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
    ) sub
    WHERE
        row_num_by_actor_login = 1
)
SELECT
    ROW_NUMBER() OVER (PARTITION BY t_year ORDER BY total DESC) AS `rank`,
    ci.repo_id AS repo_id,
    ci.repo_name AS repo_name,
    acc.t_year AS event_year,
    -- The accumulative PR creators of repo.
    acc.total
FROM accumulative_prs_by_year acc
JOIN collection_items ci ON collection_id = 10001 AND ci.repo_id = acc.repo_id
WHERE row_num_by_year = 1
ORDER BY t_year
;
