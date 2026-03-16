USE gharchive_dev;

SELECT
  t_month AS event_month, xs, s, m, l, xl, xxl, all_size
FROM (
    SELECT
        t_month,
        SUM(CASE WHEN (additions + deletions) < 10 THEN 1 ELSE 0 END) OVER(PARTITION BY t_month) AS xs,
        SUM(CASE WHEN (additions + deletions) >= 10 AND (additions + deletions) < 30 THEN 1 ELSE 0 END) OVER(PARTITION BY t_month) AS s,
        SUM(CASE WHEN (additions + deletions) >= 30 AND (additions + deletions) < 100 THEN 1 ELSE 0 END) OVER(PARTITION BY t_month) AS m,
        SUM(CASE WHEN (additions + deletions) >= 100 AND (additions + deletions) < 500 THEN 1 ELSE 0 END) OVER(PARTITION BY t_month) AS l,
        SUM(CASE WHEN (additions + deletions) >= 500 AND (additions + deletions) < 1000 THEN 1 ELSE 0 END) OVER(PARTITION BY t_month) AS xl,
        SUM(CASE WHEN (additions + deletions) >= 1000 THEN 1 ELSE 0 END) OVER (PARTITION BY t_month) AS xxl,
        COUNT(*) OVER (PARTITION BY t_month) AS all_size,
        ROW_NUMBER() OVER (PARTITION BY t_month) AS row_num
    FROM (
        SELECT
            DATE_FORMAT(created_at, '%Y-%m-01') as t_month,
            additions,
            deletions
        FROM
            github_events
        WHERE
            type = 'PullRequestEvent'
            AND repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo})LIMIT 1)
            AND action = 'opened'
            AND created_at >= ${from}
            AND created_at <= ${to}
    ) sub
) sub
WHERE row_num = 1
ORDER BY t_month
;