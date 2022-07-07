WITH company_ci AS (
    SELECT LOWER(company) AS company, COUNT(*) AS cnt
    FROM users
    WHERE
        LOWER(company) LIKE CONCAT('%', LOWER('Mini256'), '%')
    GROUP BY company
)
SELECT
    TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(company), 'www.', ''), '.com', ''), '!', ''), ',', ''), '-', ''), '@', ''), '.', ''), 'ltd', ''), 'inc', ''), 'corporation', '')) AS `name`,
    SUM(cnt) AS total
FROM company_ci
GROUP BY `name`
ORDER BY total DESC
LIMIT 10