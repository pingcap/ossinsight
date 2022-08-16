SELECT event_month, xs, s, m, l, xl, all_size
FROM (
    SELECT
        event_month,
        SUM(CASE WHEN (additions + deletions) < 10 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS xs,
        SUM(CASE WHEN (additions + deletions) >= 10 AND (additions + deletions) < 30 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS s,
        SUM(CASE WHEN (additions + deletions) >= 30 AND (additions + deletions) < 100 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS m,
        SUM(CASE WHEN (additions + deletions) >= 100 AND (additions + deletions) < 500 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS l,
        SUM(CASE WHEN (additions + deletions) >= 500 AND (additions + deletions) < 1000 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS xl,
        SUM(CASE WHEN (additions + deletions) >= 1000 THEN 1 ELSE 0 END) OVER (PARTITION BY event_month) AS xxl,
        COUNT(*) OVER (PARTITION BY event_month) AS all_size,
        ROW_NUMBER() OVER (PARTITION BY event_month) AS row_num
    FROM github_events ge
    WHERE
        creator_user_id = 5086433
        AND type = 'PullRequestEvent'
        AND action = 'closed'
        AND pr_merged = true
) AS sub
WHERE
    row_num = 1