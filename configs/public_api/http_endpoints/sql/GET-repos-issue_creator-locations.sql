USE gharchive_dev;

WITH group_by_countries AS (
    SELECT
        gu.country_code,
        COUNT(1) as issue_creators
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
        AND gu.country_code NOT IN ('', 'N/A', 'UND')
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY country_code
), summary AS (
    SELECT SUM(issue_creators) AS total FROM group_by_countries
)
SELECT 
    country_code,
    issue_creators,
    issue_creators / total AS percentage
FROM group_by_countries, summary
ORDER BY issue_creators DESC
;