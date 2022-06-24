WITH issues AS (
    SELECT DISTINCT pr_or_issue_id
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
), issue_contribution_last_month AS (
    SELECT actor_id, ANY_VALUE(actor_login) AS actor_login, COUNT(*) AS comments
    FROM github_events ge
    JOIN issues i ON i.pr_or_issue_id = ge.pr_or_issue_id
    WHERE
        repo_id = 41986369
        AND type = 'IssueCommentEvent'
        AND event_month = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users)
    GROUP BY actor_id
), issue_contribution_last_2nd_month AS (
    SELECT actor_id, ANY_VALUE(actor_login) AS actor_login, COUNT(*) AS comments
    FROM github_events ge
    JOIN issues i ON i.pr_or_issue_id = ge.pr_or_issue_id
    WHERE
        repo_id = 41986369
        AND type = 'IssueCommentEvent'
        AND event_month = DATE_FORMAT(DATE_SUB(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), INTERVAL 1 MONTH), '%Y-%m-01')
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users)
    GROUP BY actor_id
)
SELECT
    ROW_NUMBER() OVER (ORDER BY lm.comments DESC) AS row_num,
    lm.actor_id,
    lm.actor_login,
    lm.comments AS 'last_month_events',
    COALESCE(l2m.comments, 0) AS 'last_2nd_month_events',
    COALESCE(lm.comments - l2m.comments, 0) AS changes, 
    lm.comments / (SELECT COALESCE(SUM(comments), 0) FROM issue_contribution_last_month) AS proportion
FROM issue_contribution_last_month lm
LEFT JOIN issue_contribution_last_2nd_month l2m ON lm.actor_id = l2m.actor_id
ORDER BY lm.comments DESC
LIMIT 50
;