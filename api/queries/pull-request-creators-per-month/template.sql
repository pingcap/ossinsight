WITH prs_with_latest_repo_name AS (
    SELECT
        event_month,
        repo_id,
        FIRST_VALUE(repo_name) OVER(PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
        actor_login
    FROM github_events
    WHERE
        type = 'PullRequestEvent' and repo_id = 41986369 and action = 'opened'
), repo_month_group AS (
    SELECT
        event_month,
        repo_name,
        COUNT(distinct actor_login) as month_pr_count
    FROM prs_with_latest_repo_name
    GROUP BY repo_name, event_month
    ORDER BY 1, 2
)
SELECT * FROM repo_month_group;
