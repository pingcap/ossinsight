WITH issues AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE 
    type = 'IssuesEvent' 
    AND action = 'opened' 
    AND actor_id = 5086433
    AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
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
    AND actor_id = 5086433
    AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
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