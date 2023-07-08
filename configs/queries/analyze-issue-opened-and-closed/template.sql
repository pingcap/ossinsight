WITH issue_closed AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,COUNT(number) AS closed
    FROM
        github_events ge
    WHERE
        type = 'IssuesEvent'
        AND action = 'closed'
        AND repo_id = 41986369
    GROUP BY 1
), issue_opened AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month, COUNT(number) AS opened
    FROM
        github_events ge
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id = 41986369
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