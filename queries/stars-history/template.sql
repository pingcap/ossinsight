WITH prs_with_latest_repo_name AS (
    SELECT
        event_month,
        actor_login,
        repo_id,
        FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name
    FROM github_events
             USE INDEX(index_github_events_on_repo_id)
    WHERE
        type = 'WatchEvent' AND repo_id IN (41986369, 48833910)
), count_per_month AS (
    SELECT
        event_month,
        repo_name,
        COUNT(distinct actor_login) as month_star_count
    FROM prs_with_latest_repo_name
    GROUP BY repo_name, event_month
    ORDER BY 1, 2
)
SELECT
    event_month,
    repo_name,
    SUM(month_star_count) OVER(PARTITION BY repo_name ORDER BY event_month ASC) AS total
FROM count_per_month
ORDER BY event_month ASC, repo_name;
