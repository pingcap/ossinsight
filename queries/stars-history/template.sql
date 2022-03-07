WITH tmp AS (
    SELECT
        event_month,
        repo_name,
        COUNT(distinct actor_id) as month_stars_count
    FROM github_events
    use index (index_github_events_on_repo_name)
    WHERE
        type = 'WatchEvent'
        AND repo_name in ('pingcap/tidb', 'tikv/tikv')
    GROUP BY repo_name, event_month
    ORDER BY 1 ASC, 2
), tmp1 AS (
    SELECT event_month,
        repo_name,
        SUM(month_stars_count) OVER(partition by repo_name order by event_month ASC) as total
    FROM tmp
    ORDER BY event_month ASC, repo_name
)
SELECT * FROM tmp1;
