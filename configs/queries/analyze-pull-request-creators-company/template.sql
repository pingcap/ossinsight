WITH pr_creators_per_company AS (
    SELECT
        IF(
            gu.organization_formatted IS NOT NULL AND LENGTH(gu.organization_formatted) != 0,
            gu.organization_formatted,
            'Unknown'
        ) AS company_name,
        COUNT(DISTINCT ge.actor_login) AS code_contributors
    FROM github_events ge
    LEFT JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        ge.repo_id IN ({{ repoId | join: ',' }})
        AND ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
    GROUP BY company_name
), pr_creators_total AS (
    SELECT SUM(code_contributors) AS total FROM pr_creators_per_company
)
SELECT
    pcpc.company_name,
    pcpc.code_contributors,
    pcpc.code_contributors / pct.total AS proportion
FROM pr_creators_per_company pcpc, pr_creators_total pct
WHERE company_name != 'Unknown'
ORDER BY pcpc.code_contributors DESC
LIMIT {{limit}};