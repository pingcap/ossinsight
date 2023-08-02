USE gharchive_dev;

WITH pull_request_creators AS (
    SELECT
        CASE
            WHEN ${per} = 'day' THEN DATE_FORMAT(created_at, '%Y-%m-%d')
            WHEN ${per} = 'week' THEN DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%Y-%m-%d')
            ELSE DATE_FORMAT(created_at, '%Y-%m-01')
        END AS timestamp,
        ROW_NUMBER() OVER (PARTITION BY actor_login ORDER BY created_at) AS row_num
    FROM github_events ge
    WHERE
        ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
        AND ge.repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
), group_by_timestamp AS (
    SELECT
        timestamp,
        COUNT(*) AS pull_request_creators
    FROM pull_request_creators
    WHERE
        row_num = 1
    GROUP BY
        timestamp
), cumulative_by_timestamp AS (
    SELECT
        timestamp,
        SUM(pull_request_creators) OVER (ORDER BY timestamp) AS pull_request_creators,
        ROW_NUMBER() OVER(PARTITION BY timestamp) AS row_num
    FROM
        group_by_timestamp
)
SELECT
    timestamp,
    pull_request_creators
FROM cumulative_by_timestamp
WHERE row_num = 1
ORDER BY timestamp
;