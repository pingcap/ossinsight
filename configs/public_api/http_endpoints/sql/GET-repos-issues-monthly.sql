USE gharchive_dev;

with repo AS (
    SELECT repo_id
    FROM github_repos
    WHERE repo_name = CONCAT(${owner}, '/', ${repo})
    LIMIT 1
), issue_closed AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        COUNT(number) AS closed
    FROM
        github_events ge
    WHERE
        type = 'IssuesEvent'
        AND action = 'closed'
        AND repo_id = (SELECT repo_id FROM repo)
        AND created_at >= ${from}
        AND created_at <= ${to}
    GROUP BY 1
), issue_opened AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        COUNT(number) AS opened
    FROM
        github_events ge
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id = (SELECT repo_id FROM repo)
        AND created_at >= ${from}
        AND created_at <= ${to}
    GROUP BY 1
)
SELECT
    io.t_month AS event_month,
    opened,
    COALESCE(closed, 0) AS closed
FROM
    issue_opened io
    JOIN issue_closed ic ON io.t_month = ic.t_month
ORDER BY event_month
;