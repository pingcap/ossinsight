INSERT INTO mv_repo_organizations_issue_commenter_role(repo_id, org_name, first_seen_at)
SELECT
    /*+ READ_FROM_STORAGE(TIFLASH[ge, gu]) */
    ge.repo_id,
    LEFT(gu.organization_formatted, 40) AS org_name,
    MIN(ge.created_at) AS new_first_seen_at
FROM github_events ge
JOIN github_users gu ON ge.actor_login = gu.login
JOIN mv_repo_pull_requests rpr ON ge.repo_id = rpr.repo_id AND ge.number = rpr.number
WHERE
    ge.type = 'IssueCommentEvent'
    AND ge.org_id != 0
    AND ge.created_at BETWEEN :from AND :to
    AND gu.organization_formatted != ''
GROUP BY ge.repo_id, org_name
ON DUPLICATE KEY UPDATE
    first_seen_at = LEAST(first_seen_at, new_first_seen_at)
;
