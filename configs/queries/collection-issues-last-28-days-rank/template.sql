WITH issues_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT number) AS issues
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
    GROUP BY repo_id
), issues_group_by_period AS (
    SELECT
        (DATEDIFF(CURRENT_DATE(), DATE(created_at))) DIV 28 AS period,
        repo_id,
        COUNT(DISTINCT number) AS issues
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
        AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
    GROUP BY period, repo_id
), issues_last_period AS (
    SELECT
        repo_id,
        issues,
        ROW_NUMBER() OVER(ORDER BY issues DESC) AS `rank`
    FROM
        issues_group_by_period sgp
    WHERE
        period = 0

), issues_last_2nd_period AS (
    SELECT
        repo_id,
        issues,
        ROW_NUMBER() OVER(ORDER BY issues DESC) AS `rank`
    FROM
        issues_group_by_period sgp
    WHERE
        period = 1
)
SELECT
    ci.repo_id,
    ci.repo_name,
    -- Issues
    IFNULL(ilp.issues, 0) AS last_period_total,
    IFNULL(ilp.`rank`, 0) AS last_period_rank,
    IFNULL(il2p.issues, 0) AS last_2nd_period_total,
    IFNULL(il2p.`rank`, 0) AS last_2nd_period_rank,
    -- The changes of total issues between two periods.
    IFNULL(((ilp.issues - il2p.issues) / il2p.issues) * 100, 0) AS total_pop,
    -- The rank changes between two periods.
    IFNULL((ilp.`rank` - il2p.`rank`), 0) AS rank_pop,
    -- The total issues of repo.
    IFNULL(igr.issues, 0) AS total
FROM issues_group_by_repo igr
JOIN collection_items ci ON ci.collection_id = 10001 AND igr.repo_id = ci.repo_id
JOIN issues_last_period ilp ON igr.repo_id = ilp.repo_id
LEFT JOIN issues_last_2nd_period il2p ON igr.repo_id = il2p.repo_id
ORDER BY last_period_rank;
