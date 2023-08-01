USE gharchive_dev;
SELECT
    gu.country_code AS region_code,
    COUNT(DISTINCT actor_login) as issue_creators
FROM github_events ge
LEFT JOIN github_users gu ON ge.actor_login = gu.login
WHERE
    repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
    AND ge.type = 'IssuesEvent'
    AND ge.action = 'opened'
    AND gu.country_code NOT IN ('', 'N/A', 'UND')
    AND ge.created_at >= ${from}
    AND ge.created_at <= ${to}
GROUP BY region_code
ORDER BY issue_creators DESC
;