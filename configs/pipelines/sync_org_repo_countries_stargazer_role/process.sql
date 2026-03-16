INSERT INTO mv_repo_countries_pr_reviewer_role(repo_id, country_code, first_seen_at)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge, gu]) */
    ge.repo_id,
    gu.country_code,
    MIN(ge.created_at) AS new_first_seen_at
FROM github_events ge
JOIN github_users gu ON ge.actor_login = gu.login
WHERE
    ge.type = 'WatchEvent'
    AND ge.org_id != 0
    AND ge.created_at BETWEEN :from AND :to
    AND gu.country_code NOT IN ('N/A', 'UND', '')
GROUP BY ge.repo_id, gu.country_code
ON DUPLICATE KEY UPDATE
    first_seen_at = LEAST(first_seen_at, new_first_seen_at)
;
