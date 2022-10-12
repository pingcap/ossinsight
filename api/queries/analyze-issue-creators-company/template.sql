WITH issue_creator_companies AS (
    SELECT
        TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(u.organization, ',', ''), '-', ''), '@', ''), 'www.', ''), 'inc', ''), '.com', ''), '.cn', ''), '.', '')) AS company_name,
        COUNT(DISTINCT ge.actor_login) AS issue_creators
    FROM github_events ge
    LEFT JOIN github_users u USE INDEX (index_gu_on_login_is_bot_organization_country_code) ON ge.actor_login = u.login
    WHERE
        ge.repo_id in (41986369)
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
    GROUP BY 1
), s AS (
    SELECT COUNT(*) AS total FROM issue_creator_companies
)
SELECT
    company_name,
    issue_creators,
    issue_creators / s.total AS proportion
FROM s, issue_creator_companies sub
WHERE
    length(company_name) != 0
    AND company_name NOT IN ('-', 'none', 'no', 'home', 'n/a', 'null', 'unknown')
ORDER BY issue_creators DESC
LIMIT 9999999999;