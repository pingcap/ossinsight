SELECT company_name, issue_creators
FROM (
    SELECT
        TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(gu.organization, ',', ''), '-', ''), '@', ''), '.', ''), 'ltd', ''), 'inc', ''), 'com', ''), 'www', '')) as company_name,
        COUNT(distinct ge.actor_login) as issue_creators
    FROM github_events ge
    LEFT JOIN github_users gu USE INDEX (index_gu_on_login_is_bot_organization_country_code) ON ge.actor_login = gu.login
    WHERE
        ge.repo_id IN (41986369)
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
    GROUP BY company_name
 ) sub
WHERE
    LENGTH(company_name) != 0
    AND company_name NOT IN ('-', '--- click here ---', 'none', 'no', 'home', 'n/a', 'unknown', 'null')
ORDER BY issue_creators DESC
LIMIT 9999999999;
