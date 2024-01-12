WITH issues_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT number) AS issues
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
    GROUP BY repo_id
), issues_group_by_month AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS t_month,
        repo_id,
        COUNT(DISTINCT number) AS issues
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
        AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
    GROUP BY t_month, repo_id
), issues_last_month AS (
    SELECT
        t_month,
        repo_id,
        issues,
        ROW_NUMBER() OVER(ORDER BY issues DESC) AS `rank`
    FROM
        issues_group_by_month sgn
    WHERE
        t_month = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
), issues_last_2nd_month AS (
    SELECT
        t_month,
        repo_id,
        issues,
        ROW_NUMBER() OVER(ORDER BY issues DESC) AS `rank`
    FROM
        issues_group_by_month sgn
    WHERE
        t_month = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m-01')
)
SELECT
    ci.repo_id,
    ci.repo_name,
    DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m') AS current_month,
    DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 MONTH), '%Y-%m') AS last_month,
    -- Issues
    ilm.issues AS current_month_total,
    ilm.`rank` AS current_month_rank,
    IFNULL(il2m.issues, 0) AS last_month_total,
    il2m.`rank` AS last_month_rank,
    -- The total changes period over period.
    ((ilm.issues - il2m.issues) / il2m.issues) * 100 AS total_mom,
    -- The rank changes period over period.
    (ilm.`rank` - il2m.`rank`) AS rank_mom,
    -- The total issues of repo.
    igr.issues AS total
FROM issues_group_by_repo igr
JOIN collection_items ci ON ci.collection_id = 10001 AND igr.repo_id = ci.repo_id
JOIN issues_last_month ilm ON igr.repo_id = ilm.repo_id
LEFT JOIN issues_last_2nd_month il2m ON ilm.repo_id = il2m.repo_id
ORDER BY current_month_rank;
