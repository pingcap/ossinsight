INSERT INTO mv_repo_daily_engagements(repo_id, user_login, day, engagements)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge]) */
    ge.repo_id AS repo_id,
    ge.actor_login AS user_login,
    DATE(ge.created_at) AS day,
    COUNT(*) AS engagements
FROM github_events ge
WHERE
    ge.type != 'WatchEvent'
    -- Only consider events that are relevant to the org.
    AND ge.org_id != 0
    AND ge.created_at >= :from
    AND ge.created_at < :to
GROUP BY
    ge.repo_id, ge.actor_login, day
ON DUPLICATE KEY UPDATE
    engagements = VALUES(engagements)
;
