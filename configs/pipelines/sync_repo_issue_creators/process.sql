INSERT INTO mv_repo_issue_creators(repo_id, user_id, issues, first_issue_opened_at)
WITH users_trigger_issue_events AS (
    SELECT
        /*+ READ_FROM_STORAGE(TIFLASH[ge]) */
        repo_id, actor_id AS user_id
    FROM github_events ge
    WHERE
        type = 'IssuesEvent'
        AND created_at >= :from AND created_at < :to
    GROUP BY repo_id, actor_id
)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge2]) */
    ge2.repo_id,
    ge2.actor_id AS user_id,
    COUNT(DISTINCT number) AS issues,
    MIN(ge2.created_at) AS first_issue_opened_at
FROM github_events ge2
JOIN users_trigger_issue_events u ON ge2.repo_id = u.repo_id
WHERE
    ge2.type = 'IssuesEvent'
    AND ge2.action = 'opened'
    AND ge2.actor_id = u.user_id
GROUP BY ge2.repo_id, user_id
ON DUPLICATE KEY UPDATE
    issues = VALUES(issues),
    first_issue_opened_at = VALUES(first_issue_opened_at)
;