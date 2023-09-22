INSERT INTO mv_repo_participants (repo_id, user_id, first_engagement_at)
SELECT
    ge.repo_id,
    ge.actor_id AS user_id,
    MIN(ge.created_at) AS new_first_engagement_at
FROM github_events ge
WHERE
    ge.type != 'WatchEvent'
    AND ge.org_id != 0
    AND ge.created_at >= :from
    AND ge.created_at < :to
GROUP BY repo_id, actor_id
ON DUPLICATE KEY UPDATE first_engagement_at = LEAST(first_engagement_at, new_first_engagement_at)
;