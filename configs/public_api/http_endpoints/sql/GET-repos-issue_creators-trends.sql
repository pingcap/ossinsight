USE gharchive_dev;

WITH issue_creators AS (
    SELECT
        CASE
            WHEN ${per} = 'day' THEN DATE_FORMAT(created_at, '%Y-%m-%d')
            WHEN ${per} = 'week' THEN DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%Y-%m-%d')
            ELSE DATE_FORMAT(created_at, '%Y-%m-01')
        END AS timestamp,
        ROW_NUMBER() OVER (PARTITION BY actor_login ORDER BY created_at) AS row_num
    FROM github_events ge
    WHERE
        ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
        AND ge.repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
), group_by_timestamp AS (
    SELECT
        timestamp,
        COUNT(*) AS issue_creators
    FROM issue_creators
    WHERE
        row_num = 1
    GROUP BY
        timestamp
), cumulative_by_timestamp AS (
    SELECT
        timestamp,
        SUM(issue_creators) OVER (ORDER BY timestamp) AS issue_creators,
        ROW_NUMBER() OVER(PARTITION BY timestamp) AS row_num
    FROM
        group_by_timestamp
)
SELECT
    timestamp,
    issue_creators
FROM cumulative_by_timestamp
WHERE row_num = 1
ORDER BY timestamp
;