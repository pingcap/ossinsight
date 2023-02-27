WITH acc AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        repo_id,
        COUNT(*) OVER (PARTITION BY repo_id ORDER BY DATE_FORMAT(created_at, '%Y-%m-01')) AS total,
        ROW_NUMBER() OVER (PARTITION BY repo_id, DATE_FORMAT(created_at, '%Y-%m-01')) AS row_num
    FROM github_events ge
    USE INDEX(index_ge_on_repo_id_type_action_created_at_actor_login)
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
        -- Exclude Bots
        AND actor_login NOT LIKE '%bot%'
        AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
), acc_group_by_month AS (
    SELECT
        t_month,
        repo_id,
        total
    FROM acc
    WHERE row_num = 1
)
SELECT
    acc.t_month AS event_month,
    gr.repo_name AS repo_name,
    acc.total
FROM acc_group_by_month acc
LEFT JOIN github_repos gr ON gr.repo_id = acc.repo_id
WHERE
    gr.repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
ORDER BY t_month
;