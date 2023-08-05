USE gharchive_dev;

WITH group_by_org AS (
  SELECT
      LOWER(REPLACE(gu.organization, '@', '')) AS org_name,
      COUNT(DISTINCT ge.actor_login) AS pull_request_creators
  FROM github_events ge
  LEFT JOIN github_users gu ON ge.actor_login = gu.login
  WHERE
      ge.repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
      AND ge.type = 'PullRequestEvent'
      AND ge.action = 'opened'
      AND ge.created_at >= ${from}
      AND ge.created_at <= ${to}
      AND gu.organization != ''
  GROUP BY org_name
), summary AS (
  SELECT SUM(pull_request_creators) AS total FROM group_by_org
)
SELECT 
    org_name,
    pull_request_creators,
    pull_request_creators / total AS percentage
FROM group_by_org, summary
ORDER BY pull_request_creators DESC;