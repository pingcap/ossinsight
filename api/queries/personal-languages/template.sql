WITH prs_with_language AS (
    SELECT COUNT(DISTINCT pr_or_issue_id) cnt
    FROM github_events ge
    WHERE type = 'PullRequestEvent' AND actor_id = 5086433 AND language IS NOT NULL
) 
SELECT
    language,
    COUNT(DISTINCT pr_or_issue_id) AS prs,
    COUNT(DISTINCT pr_or_issue_id) / (SELECT cnt FROM prs_with_language) percentage
FROM github_events ge
WHERE type = 'PullRequestEvent' AND actor_id = 5086433 AND language IS NOT NULL
GROUP BY language
ORDER BY prs DESC