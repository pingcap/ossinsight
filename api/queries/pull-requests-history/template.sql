WITH prs_with_latest_repo_name AS (
    SELECT
        event_month,
        number,
        repo_id,
        FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name
    FROM github_events
    WHERE
        type = 'PullRequestEvent' AND repo_id = 41986369 AND action = 'opened'
), count_per_month AS (
    SELECT
        event_month,
        repo_name,
        COUNT(distinct number) as month_pr_count
    FROM prs_with_latest_repo_name
    GROUP BY repo_name, event_month
    ORDER BY 1, 2
)
SELECT
    event_month,
    repo_name,
    SUM(month_pr_count) OVER(PARTITION BY repo_name ORDER BY event_month ASC) AS total
FROM count_per_month
ORDER BY event_month ASC, repo_name;
