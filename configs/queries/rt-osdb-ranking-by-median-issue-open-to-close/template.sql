WITH tdiff AS (
    SELECT
        group_name AS repo_group_name,
        TIMESTAMPDIFF(HOUR, ge.pr_or_issue_created_at, ge.created_at) / 24 AS diff
    FROM
        github_events ge
        JOIN osdb_repos db ON ge.repo_id = db.id
    WHERE
        type = 'IssuesEvent'
        AND action = 'closed'
        AND creator_user_login NOT LIKE '%bot%'
        AND creator_user_login NOT IN ('cockroach-teamcity', 'elasticmachine')
), trank AS (
    SELECT
        repo_group_name,
        diff,
        ROW_NUMBER() OVER (PARTITION BY repo_group_name ORDER BY diff) AS r,
        count(*) OVER (PARTITION BY repo_group_name) AS cnt
    FROM
        tdiff
    WHERE
        diff > 0.1
)
SELECT
    repo_group_name,
    diff AS 'days'
FROM
    trank
WHERE
    r = (cnt DIV 2)
ORDER BY 2 ASC
