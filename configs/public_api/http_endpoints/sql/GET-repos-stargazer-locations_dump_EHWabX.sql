USE gharchive_dev;
WITH group_by_area AS (
    SELECT
        gu.country_code AS country_or_area,
        COUNT(DISTINCT actor_login) as cnt
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
        AND gu.country_code NOT IN ('', 'N/A', 'UND')
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY country_or_area
), summary AS (
    SELECT SUM(cnt) AS total FROM group_by_area
)
SELECT 
    country_or_area,
    cnt AS count,
    cnt / summary.total AS percentage
FROM group_by_area, summary
ORDER BY cnt DESC
;