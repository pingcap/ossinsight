USE gharchive_dev;

WITH group_by_org AS (
  SELECT
      LOWER(REPLACE(gu.organization, '@', '')) AS org_name,
      COUNT(DISTINCT ge.actor_login) AS stargazers
  FROM github_events ge
  LEFT JOIN github_users gu ON ge.actor_login = gu.login
  WHERE
      ge.repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
      AND ge.type = 'WatchEvent'
      AND ge.action = 'started'
      AND ge.created_at >= ${from}
      AND ge.created_at <= ${to}
      AND gu.organization != ''
  GROUP BY org_name
), summary AS (
  SELECT SUM(stargazers) AS total FROM group_by_org
)
SELECT 
    org_name,
    stargazers,
    stargazers / total AS percentage
FROM group_by_org, summary
ORDER BY stargazers DESC;