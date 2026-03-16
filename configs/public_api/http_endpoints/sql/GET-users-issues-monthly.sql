USE gharchive_dev;

WITH user AS (
    SELECT id AS user_id
    FROM github_users
    WHERE login = ${username}
    LIMIT 1
), issues AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE 
        type = 'IssuesEvent' 
        AND action = 'opened' 
        AND actor_id = (SELECT user_id FROM user)
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY 1
    ORDER BY 1
), issue_comments AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE 
        type = 'IssueCommentEvent' 
        AND action = 'created' 
        AND actor_id = (SELECT user_id FROM user)
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY 1
    ORDER BY 1
), event_months AS (
    SELECT DISTINCT event_month
    FROM (
        SELECT event_month
        FROM issues
        UNION
        SELECT event_month
        FROM issue_comments
    ) sub
)
SELECT
    m.event_month,
    IFNULL(i.cnt, 0) AS issues,
    IFNULL(ic.cnt, 0) AS issue_comments
FROM event_months m
LEFT JOIN issues i ON m.event_month = i.event_month
LEFT JOIN issue_comments ic ON m.event_month = ic.event_month