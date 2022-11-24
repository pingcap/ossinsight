WITH group_by_area AS (
    SELECT
        gu.country_code AS country_or_area,
        COUNT(1) as cnt
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        repo_id IN (41986369)
        AND ge.type = 'WatchEvent'
        AND ge.action = 'started'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND gu.country_code IS NOT NULL  -- TODO: remove
        AND gu.country_code != ''
        AND gu.country_code != 'N/A'
        AND gu.country_code != 'UND'
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
