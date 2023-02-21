WITH count_per_month AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        COUNT(*) as month_pr_count
    FROM github_events
    WHERE
        type = 'PullRequestEvent' AND repo_id = 41986369 AND action = 'opened'
    GROUP BY t_month
    ORDER BY t_month
)
SELECT
    t_month,
    SUM(month_pr_count) OVER(ORDER BY t_month ASC) AS total
FROM count_per_month
ORDER BY t_month ASC;
