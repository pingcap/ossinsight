INSERT INTO mv_repo_pull_request_creators(repo_id, user_id, prs, first_pr_opened_at, first_pr_merged_at)
WITH users_trigger_pr_events_recently AS (
    SELECT
        /*+ READ_FROM_STORAGE(TIFLASH[ge]) */
        repo_id, actor_id AS user_id
    FROM github_events ge
    WHERE
        type = 'PullRequestEvent'
        AND created_at >= :from AND created_at < :to
    GROUP BY repo_id, actor_id
)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge2]) */
    ge2.repo_id,
    CASE
        WHEN ge2.action = 'opened' THEN ge2.actor_id
        WHEN ge2.action = 'closed' AND pr_merged = 1 THEN ge2.creator_user_id
        END AS user_id,
    COUNT(DISTINCT number) AS prs,
    MIN(IF(ge2.action = 'opened', ge2.created_at, NULL)) AS first_pr_opened_at,
    MIN(IF(ge2.action = 'closed' AND pr_merged = 1, ge2.created_at, NULL)) AS first_pr_merged_at
FROM github_events ge2
JOIN users_trigger_pr_events_recently u ON ge2.repo_id = u.repo_id
WHERE
    ge2.type = 'PullRequestEvent'
    AND (
        (ge2.action = 'opened' AND ge2.actor_id = u.user_id)
        OR (ge2.action = 'closed' AND pr_merged = 1 AND ge2.creator_user_id = u.user_id)
    )
GROUP BY ge2.repo_id, user_id
ON DUPLICATE KEY UPDATE
    prs = VALUES(prs),
    first_pr_opened_at = VALUES(first_pr_opened_at),
    first_pr_merged_at = VALUES(first_pr_merged_at)
;