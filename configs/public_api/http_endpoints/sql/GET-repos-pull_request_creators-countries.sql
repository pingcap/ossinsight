USE gharchive_dev;

WITH group_by_countries AS (
    SELECT
        CASE
          WHEN TRIM(gu.country_code) IN ('', 'N/A', 'UND') OR gu.country_code IS NULL THEN 'UNKNOWN'
          ELSE gu.country_code
        END AS country_code,
        COUNT(DISTINCT actor_login) as pull_request_creators
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
        AND ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
        AND IF(${exclude_unknown} = TRUE, gu.country_code NOT IN ('', 'N/A', 'UND'), TRUE)
    GROUP BY 1
), summary AS (
    SELECT SUM(pull_request_creators) AS total FROM group_by_countries
)
SELECT 
    country_code,
    pull_request_creators,
    pull_request_creators / total AS percentage
FROM group_by_countries, summary
ORDER BY pull_request_creators DESC
;