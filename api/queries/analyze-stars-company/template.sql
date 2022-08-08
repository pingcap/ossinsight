WITH star_companies AS (
    SELECT
        TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(u.company), ',', ''), '-', ''), '@', ''), 'www.', ''), 'inc', ''), '.com', ''), '.cn', ''), '.', '')) AS company_name,
        COUNT(DISTINCT ge.actor_login) AS stargazers
    FROM github_events ge
    LEFT JOIN users u ON ge.actor_login = u.login
    WHERE
        ge.repo_id in (41986369)
        AND ge.type = 'WatchEvent'
    GROUP BY 1
)
SELECT
    company_name,
    stargazers,
    stargazers / (
        SELECT COUNT(*)
        FROM star_companies
    ) AS proportion
FROM star_companies sub
WHERE
    length(company_name) != 0
    AND company_name NOT IN ('-', 'none', 'no', 'home', 'n/a', 'null', 'unknown')
ORDER BY stargazers DESC
LIMIT 9999999999;