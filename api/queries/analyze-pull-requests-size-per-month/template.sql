SELECT event_month, xs, s, m, l, xl, all_size
FROM (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') as event_month,
        SUM(CASE WHEN (additions + deletions) < 10 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS xs,
        SUM(CASE WHEN (additions + deletions) >= 10 AND (additions + deletions) < 30 THEN 1 ELSE 0 END) OVER(PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01')) AS s,
        SUM(CASE WHEN (additions + deletions) >= 30 AND (additions + deletions) < 100 THEN 1 ELSE 0 END) OVER(PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01')) AS m,
        SUM(CASE WHEN (additions + deletions) >= 100 AND (additions + deletions) < 500 THEN 1 ELSE 0 END) OVER(PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01')) AS l,
        SUM(CASE WHEN (additions + deletions) >= 500 AND (additions + deletions) < 1000 THEN 1 ELSE 0 END) OVER(PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01')) AS xl,
        SUM(CASE WHEN (additions + deletions) >= 1000 THEN 1 ELSE 0 END) OVER (PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01')) AS xxl,
        COUNT(*) OVER (PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01')) AS all_size,
        ROW_NUMBER() OVER (PARTITION BY DATE_FORMAT(created_at, '%Y-%m-01')) AS row_num
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND repo_id = 41986369
        AND action = 'opened'
) sub
WHERE row_num = 1
ORDER BY event_month
;
