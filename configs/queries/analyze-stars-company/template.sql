WITH stars_per_company AS (
    SELECT
        IF(
            gu.organization_formatted IS NOT NULL AND LENGTH(gu.organization_formatted) != 0,
            gu.organization_formatted,
            'Unknown'
        ) AS company_name,
        COUNT(DISTINCT ge.actor_login) AS stargazers
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        ge.repo_id IN ({{ repoId | join: ',' }})
        AND ge.type = 'WatchEvent'
        AND ge.action = 'started'
    GROUP BY company_name
), stars_total AS (
    SELECT SUM(stargazers) AS total FROM stars_per_company
)
SELECT
    spc.company_name,
    spc.stargazers,
    spc.stargazers / st.total AS proportion
FROM stars_per_company spc, stars_total st
WHERE spc.company_name != 'Unknown'
ORDER BY spc.stargazers DESC
LIMIT {{limit}};