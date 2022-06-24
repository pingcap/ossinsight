WITH prs_with_latest_repo_name AS (
    SELECT
        event_month,
        number,
        repo_id,
        additions,
        deletions
    FROM github_events
    USE INDEX(index_github_events_on_repo_id)
    WHERE
        type = 'PullRequestEvent' AND repo_id = 41986369 AND action = 'opened'
), prs as (
    SELECT
        event_month,
        SUM(CASE WHEN (additions + deletions) < 10 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS xs,
        SUM(CASE WHEN (additions + deletions) >= 10 AND (additions + deletions) < 30 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS s,
        SUM(CASE WHEN (additions + deletions) >= 30 AND (additions + deletions) < 100 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS m,
        SUM(CASE WHEN (additions + deletions) >= 100 AND (additions + deletions) < 500 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS l,
        SUM(CASE WHEN (additions + deletions) >= 500 AND (additions + deletions) < 1000 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS xl,
        SUM(CASE WHEN (additions + deletions) >= 1000 THEN 1 ELSE 0 END) OVER (PARTITION BY event_month) AS xxl,
        COUNT(*) OVER (PARTITION BY event_month) AS all_size
    FROM prs_with_latest_repo_name
)
select *
from prs
group by event_month
order by event_month
;