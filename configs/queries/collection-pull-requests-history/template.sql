WITH accumulative_prs_by_month AS (
    SELECT
        t_month,
        repo_id,
        COUNT(*) OVER (PARTITION BY repo_id ORDER BY t_month) AS total,
        -- De-duplicate by t_month column, keeping only the first accumulative value of each month.
        ROW_NUMBER() OVER (PARTITION BY repo_id, t_month) AS row_num_by_month
    FROM (
        SELECT
            repo_id,
            number,
            DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
            -- De-duplicate by number column, keeping only the first event of each PR.
            ROW_NUMBER() OVER (PARTITION BY repo_id, number ORDER BY created_at) AS row_num_by_number
        FROM github_events ge
        WHERE
            type = 'PullRequestEvent'
            AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
    ) sub
    WHERE
        row_num_by_number = 1
)
SELECT
    gr.repo_id AS repo_id,
    gr.repo_name AS repo_name,
    acc.t_month AS event_month,
    acc.total
FROM accumulative_prs_by_month acc
LEFT JOIN github_repos gr ON gr.repo_id = acc.repo_id
WHERE row_num_by_month = 1
ORDER BY t_month
;
