WITH star_companies AS (
    SELECT
        TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(gu.organization, ',', ''), '-', ''), '@', ''), 'www.', ''), 'inc', ''), '.com', ''), '.cn', ''), '.', '')) AS company_name,
        COUNT(DISTINCT ge.actor_login) AS stargazers
    FROM github_events ge
    LEFT JOIN github_users gu USE INDEX (index_gu_on_login_is_bot_organization_country_code) ON ge.actor_login = gu.login
    WHERE
        ge.repo_id in (41986369)
        AND ge.type = 'WatchEvent'
    GROUP BY 1
), summary AS (
    SELECT COUNT(*) AS total FROM star_companies
)
SELECT
    company_name,
    stargazers,
    stargazers / summary.total AS proportion
FROM star_companies, summary
WHERE
    length(company_name) != 0
    AND company_name NOT IN ('-', 'none', 'no', 'home', 'n/a', 'null', 'unknown')
ORDER BY stargazers DESC
LIMIT 9999999999;