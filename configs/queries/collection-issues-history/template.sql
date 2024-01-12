WITH accumulative_issues_by_month AS (
    SELECT
        t_month,
        repo_id,
        COUNT(*) OVER (PARTITION BY repo_id ORDER BY t_month) AS total,
        -- De-duplicate by `t_month` column, keeping only the first accumulative value of each month.
        ROW_NUMBER() OVER (PARTITION BY repo_id, t_month) AS row_num_by_month
    FROM (
        SELECT
            repo_id,
            DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
            -- De-duplicate by `number` column, keeping only the first event of each issue.
            ROW_NUMBER() OVER (PARTITION BY repo_id, number ORDER BY created_at) AS row_num_by_number
        FROM github_events ge
        WHERE
            type = 'IssuesEvent'
            AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
    ) sub
    WHERE
        row_num_by_number = 1
)
SELECT
    ci.repo_id AS repo_id,
    ci.repo_name AS repo_name,
    acc.t_month AS event_month,
    -- The accumulative issues of each month.
    acc.total
FROM accumulative_issues_by_month acc
JOIN collection_items ci ON ci.collection_id = 10001 AND ci.repo_id = acc.repo_id
WHERE row_num_by_month = 1
ORDER BY t_month
;
