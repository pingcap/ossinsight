WITH group_by_area AS (
    SELECT
        UPPER(u.country_code) AS country_or_area,
        COUNT(1) as cnt
    FROM github_events ge
    LEFT JOIN users_refined u ON ge.actor_login = u.login
    WHERE
        repo_id IN (41986369)
        AND ge.type = 'WatchEvent'
        AND ge.action = 'started'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND u.country_code IS NOT NULL
    GROUP BY country_or_area
    ORDER BY cnt DESC
), s AS (
    SELECT SUM(cnt) AS total FROM group_by_area
)
SELECT country_or_area, cnt AS count, cnt / s.total AS percentage
FROM group_by_area
JOIN s ON 1 = 1
;
