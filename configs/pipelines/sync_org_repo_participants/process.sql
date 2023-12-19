INSERT INTO mv_repo_participants(repo_id, user_login, first_engagement_at, last_engagement_at)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge]) */
    ge.repo_id,
    ge.actor_login AS user_login,
    MIN(ge.created_at) AS new_first_engagement_at,
    MAX(ge.created_at) AS new_last_engagement_at
FROM github_events ge
WHERE
    ge.type != 'WatchEvent'
    AND ge.org_id != 0
    AND ge.created_at >= :from
    AND ge.created_at < :to
GROUP BY ge.repo_id, ge.actor_login
ON DUPLICATE KEY UPDATE
    first_engagement_at = LEAST(first_engagement_at, new_first_engagement_at),
    last_engagement_at = GREATEST(last_engagement_at, new_last_engagement_at)
;
