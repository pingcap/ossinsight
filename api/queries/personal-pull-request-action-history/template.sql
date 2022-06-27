WITH user_prs AS (
    SELECT DISTINCT pr_or_issue_id AS pr_id
    FROM github_events ge
    WHERE type = 'PullRequestEvent' AND actor_id = 5086433 AND action = 'opened' 
), user_merged_prs AS (
    SELECT event_month, COUNT(*) AS cnt
    FROM github_events ge
    JOIN user_prs pr ON ge.pr_or_issue_id = pr.pr_id
    WHERE type = 'PullRequestEvent' AND action = 'closed' AND pr_merged = true 
    GROUP BY event_month
    ORDER BY event_month
), user_open_prs AS (
    SELECT event_month, COUNT(*) AS cnt
    FROM github_events ge
    JOIN user_prs pr ON ge.pr_or_issue_id = pr.pr_id
    WHERE type = 'PullRequestEvent' AND action = 'opened'
    GROUP BY event_month
    ORDER BY event_month
), event_months AS (
    SELECT DISTINCT event_month
    FROM (
        SELECT event_month
        FROM user_open_prs
        UNION
        SELECT event_month
        FROM user_merged_prs
    ) sub
)
SELECT m.event_month, IFNULL(opr.cnt, 0) AS opened_prs, IFNULL(mpr.cnt, 0) AS merged_prs
FROM event_months m
LEFT JOIN user_open_prs opr ON m.event_month = opr.event_month
LEFT JOIN user_merged_prs mpr ON m.event_month = mpr.event_month