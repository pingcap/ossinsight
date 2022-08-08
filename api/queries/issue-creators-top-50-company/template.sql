SELECT company_name, issue_creators
FROM (
    SELECT
        TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(u.company), ',', ''), '-', ''), '@', ''), '.', ''), 'ltd', ''), 'inc', ''), 'com', ''), 'www', '')) as company_name,
        COUNT(distinct actor_login) as issue_creators
    FROM github_events
    LEFT JOIN users u ON github_events.actor_login = u.login
    WHERE
        repo_id IN (41986369)
        AND github_events.type = 'IssuesEvent'
        AND action = 'opened'
    GROUP BY company_name
 ) sub
WHERE
    LENGTH(company_name) != 0
    AND company_name NOT IN ('-', '--- click here ---', 'none', 'no', 'home', 'n/a', 'unknown', 'null')
ORDER BY issue_creators DESC
LIMIT 9999999999;
