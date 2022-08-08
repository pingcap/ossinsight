WITH issue_creator_companies AS (
    SELECT
        TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(u.company), ',', ''), '-', ''), '@', ''), 'www.', ''), 'inc', ''), '.com', ''), '.cn', ''), '.', '')) AS company_name,
        COUNT(DISTINCT ge.actor_id) AS issue_creators
    FROM github_events ge
    LEFT JOIN users u ON ge.actor_login = u.login
    WHERE
        ge.repo_id in (41986369)
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
    GROUP BY 1
)
SELECT
    company_name,
    issue_creators,
    issue_creators / (
        SELECT COUNT(*)
        FROM issue_creator_companies
    ) AS proportion
FROM issue_creator_companies sub
WHERE
    length(company_name) != 0
    AND company_name NOT IN ('-', 'none', 'no', 'home', 'n/a', 'null', 'unknown')
ORDER BY issue_creators DESC
LIMIT 9999999999;