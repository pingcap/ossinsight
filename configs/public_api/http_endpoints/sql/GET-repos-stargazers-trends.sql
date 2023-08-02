USE gharchive_dev;

WITH stars AS (
    SELECT
        CASE
            WHEN ${per} = 'day' THEN DATE_FORMAT(created_at, '%Y-%m-%d')
            WHEN ${per} = 'week' THEN DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%Y-%m-%d')
            ELSE DATE_FORMAT(created_at, '%Y-%m-01')
        END AS timestamp,
        ROW_NUMBER() OVER (PARTITION BY actor_login) AS row_num
    FROM github_events ge
    WHERE
        ge.type = 'WatchEvent'
        AND ge.action = 'started'
        AND ge.repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
), group_by_dt AS (
    SELECT
        timestamp,
        COUNT(*) AS stargazers
    FROM stars
    WHERE
        row_num = 1
    GROUP BY
        timestamp
), cumulative_by_dt AS (
    SELECT
        timestamp,
        SUM(stargazers) OVER (ORDER BY timestamp) AS stargazers,
        ROW_NUMBER() OVER(PARTITION BY timestamp) AS row_num
    FROM
        group_by_dt
)
SELECT
    timestamp,
    stargazers
FROM cumulative_by_dt
WHERE row_num = 1
ORDER BY timestamp
;