USE gharchive_dev;
WITH group_by_region AS (
    SELECT
        gu.country_code AS region_code,
        COUNT(1) as cnt
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.type = 'WatchEvent'
        AND ge.action = 'started'
        AND gu.country_code NOT IN ('', 'N/A', 'UND')
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY region_code
), summary AS (
    SELECT SUM(cnt) AS total FROM group_by_region
)
SELECT 
    region_code,
    cnt AS stargazers,
    cnt / summary.total AS percentage
FROM group_by_region, summary
ORDER BY stargazers DESC
;