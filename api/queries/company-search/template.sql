WITH company_ci AS (
    SELECT gu.organization AS company, COUNT(1) AS cnt
    FROM github_users gu
    WHERE
        gu.organization LIKE CONCAT('%', 'PingCAP', '%')
    GROUP BY company
)
SELECT
    TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(company, 'www.', ''), '.com', ''), '!', ''), ',', ''), '-', ''), '@', ''), '.', ''), 'ltd', ''), 'inc', ''), 'corporation', '')) AS `name`,
    SUM(cnt) AS total
FROM company_ci
GROUP BY `name`
ORDER BY total DESC
LIMIT 10