USE gharchive_dev;
WITH pr_creator_orgs AS (
    SELECT
        gu.organization AS org_name,
        COUNT(DISTINCT ge.actor_login) AS code_contributors
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY org_name
), summary AS (
    SELECT COUNT(*) AS total FROM pr_creator_orgs
)
SELECT
    org_name,
    code_contributors,
    code_contributors / summary.total AS proportion
FROM pr_creator_orgs, summary
WHERE
    org_name != ''
ORDER BY code_contributors DESC
;