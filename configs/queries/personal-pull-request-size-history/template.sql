SELECT event_month, xs, s, m, l, xl, all_size
FROM (
    SELECT
        event_month,
        SUM(CASE WHEN changes < 10 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS xs,
        SUM(CASE WHEN changes >= 10 AND changes < 30 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS s,
        SUM(CASE WHEN changes >= 30 AND changes < 100 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS m,
        SUM(CASE WHEN changes >= 100 AND changes < 500 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS l,
        SUM(CASE WHEN changes >= 500 AND changes < 1000 THEN 1 ELSE 0 END) OVER(PARTITION BY event_month) AS xl,
        SUM(CASE WHEN changes >= 1000 THEN 1 ELSE 0 END) OVER (PARTITION BY event_month) AS xxl,
        COUNT(*) OVER (PARTITION BY event_month) AS all_size,
        ROW_NUMBER() OVER (PARTITION BY event_month) AS row_num
    FROM (
        SELECT
            DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
            additions + deletions AS changes
        FROM github_events ge
        WHERE
            creator_user_id = 5086433
            AND type = 'PullRequestEvent'
            AND action = 'closed'
            AND pr_merged = true
    ) sub
) AS sub
WHERE
    row_num = 1
