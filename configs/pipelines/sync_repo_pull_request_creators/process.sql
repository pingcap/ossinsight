INSERT INTO mv_repo_pull_request_creators(repo_id, user_id, prs, first_pr_opened_at, first_pr_merged_at)
WITH users_trigger_pr_events_recently AS (
    SELECT
        /*+ READ_FROM_STORAGE(TIFLASH[github_events]) */
        repo_id, actor_id AS user_id
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND created_at >= :from AND created_at < :to
    GROUP BY repo_id, actor_id
)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge]) */
    ge.repo_id,
    CASE
        WHEN ge.action = 'opened' THEN ge.actor_id
        WHEN ge.action = 'closed' AND pr_merged = 1 THEN ge.creator_user_id
        END AS user_id,
    COUNT(DISTINCT number) AS prs,
    MIN(IF(ge.action = 'opened', ge.created_at, NULL)) AS first_pr_opened_at,
    MIN(IF(ge.action = 'closed' AND pr_merged = 1, ge.created_at, NULL)) AS first_pr_merged_at
FROM github_events ge
JOIN users_trigger_pr_events_recently u ON ge.repo_id = u.repo_id
WHERE
    ge.type = 'PullRequestEvent'
    AND (
        (ge.action = 'opened' AND ge.actor_id = u.user_id)
        OR (ge.action = 'closed' AND pr_merged = 1 AND ge.creator_user_id = u.user_id)
    )
GROUP BY ge.repo_id, user_id
ON DUPLICATE KEY UPDATE
    prs = VALUES(prs),
    first_pr_opened_at = VALUES(first_pr_opened_at),
    first_pr_merged_at = VALUES(first_pr_merged_at)
;