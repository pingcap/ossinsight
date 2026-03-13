WITH issue_creator_per_company AS (
    SELECT
        IF(
            gu.organization_formatted IS NOT NULL AND LENGTH(gu.organization_formatted) != 0,
            gu.organization_formatted,
            'Unknown'
        ) AS company_name,
        COUNT(DISTINCT ge.actor_login) AS issue_creators
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        ge.repo_id IN ({{ repoId | join: ',' }})
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
    GROUP BY company_name
), issue_creator_total AS (
    SELECT SUM(issue_creators) AS total FROM issue_creator_per_company
)
SELECT
    icpc.company_name,
    icpc.issue_creators,
    icpc.issue_creators / ict.total AS proportion
FROM issue_creator_per_company icpc, issue_creator_total ict
WHERE company_name != 'Unknown'
ORDER BY issue_creators DESC
LIMIT {{limit}};