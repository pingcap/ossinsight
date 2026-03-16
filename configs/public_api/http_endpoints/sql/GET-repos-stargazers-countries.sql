USE gharchive_dev;

WITH group_by_countries AS (
    SELECT
        CASE
          WHEN TRIM(gu.country_code) IN ('', 'N/A', 'UND') OR gu.country_code IS NULL THEN 'UNKNOWN'
          ELSE gu.country_code
        END AS country_code,
        COUNT(1) as stargazers
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.type = 'WatchEvent'
        AND ge.action = 'started'
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
        AND IF(${exclude_unknown} = TRUE, gu.country_code NOT IN ('', 'N/A', 'UND'), TRUE)
    GROUP BY 1
), summary AS (
    SELECT SUM(stargazers) AS total FROM group_by_countries
)
SELECT 
    country_code,
    stargazers,
    stargazers / total AS percentage
FROM group_by_countries, summary
ORDER BY stargazers DESC
;