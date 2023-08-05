USE gharchive_dev;

WITH group_by_org AS (
  SELECT
      LOWER(REPLACE(gu.organization, '@', '')) AS org_name,
      COUNT(DISTINCT ge.actor_login) AS issue_creators
  FROM github_events ge
  LEFT JOIN github_users gu ON ge.actor_login = gu.login
  WHERE
      ge.repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
      AND ge.type = 'IssuesEvent'
      AND ge.action = 'opened'
      AND ge.created_at >= ${from}
      AND ge.created_at <= ${to}
      AND gu.organization != ''
  GROUP BY org_name
), summary AS (
  SELECT SUM(issue_creators) AS total FROM group_by_org
)
SELECT 
    org_name,
    issue_creators,
    issue_creators / total AS percentage
FROM group_by_org, summary
ORDER BY issue_creators DESC;