SELECT
    actor_id, ANY_VALUE(actor_login) AS actor_login, COUNT(DISTINCT pr_or_issue_id) AS pr_or_issues
FROM github_events
WHERE 
    repo_id = 41986369
    AND (
        (type = 'IssuesEvent' AND action = 'closed')
        OR (type = 'IssueCommentEvent' AND action = 'created')
    )
    AND event_month = DATE_FORMAT(DATE_SUB(now(), interval DAYOFMONTH(now()) day), '%Y-%m-01')
    AND actor_login NOT LIKE '%[bot]'
    AND actor_login NOT LIKE '%bot'
GROUP BY actor_id
ORDER BY events DESC
LIMIT 9999999999;