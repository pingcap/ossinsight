WITH prs_opened AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        repo_id,
        COUNT(DISTINCT actor_login) AS pr_creators
    FROM github_events ge
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001 LIMIT 500)
    GROUP BY repo_id, t_month
), prs_opened_group_by_month AS (
    SELECT
        t_month,
        repo_id,
        SUM(pr_creators) OVER (PARTITION BY repo_id ORDER BY t_month) AS prs
    FROM prs_opened
)
SELECT
     pogbm.t_month AS event_month,
     gr.repo_id,
     gr.repo_name,
     pogbm.prs AS total
FROM prs_opened_group_by_month pogbm
         JOIN github_repos gr ON pogbm.repo_id = gr.repo_id
GROUP BY t_month, repo_id
ORDER BY t_month
;