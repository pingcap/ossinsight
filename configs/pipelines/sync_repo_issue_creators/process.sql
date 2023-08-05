INSERT INTO mv_repo_issue_creators(repo_id, user_id, issues, first_issue_opened_at)
WITH users_trigger_issue_events AS (
    SELECT
        /*+ READ_FROM_STORAGE(TIFLASH[github_events]) */
        repo_id, actor_id AS user_id
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND created_at >= :from AND created_at < :to
    GROUP BY repo_id, actor_id
)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge]) */
    ge.repo_id,
    ge.actor_id AS user_id,
    COUNT(DISTINCT number) AS issues,
    MIN(ge.created_at) AS first_issue_opened_at
FROM github_events ge
JOIN users_trigger_issue_events u ON ge.repo_id = u.repo_id
WHERE
    ge.type = 'IssuesEvent'
    AND ge.action = 'opened'
    AND ge.actor_id = u.user_id
GROUP BY ge.repo_id, user_id
ON DUPLICATE KEY UPDATE
    issues = VALUES(issues),
    first_issue_opened_at = VALUES(first_issue_opened_at)
;