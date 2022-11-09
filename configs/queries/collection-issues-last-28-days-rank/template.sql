WITH issues_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT number) AS issues
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id IN (41986369, 16563587, 105944401)
        AND action = 'opened'
    GROUP BY repo_id
), issues_group_by_period AS (
    SELECT
        (DATEDIFF(CURRENT_DATE(), event_day)) DIV 28 AS period,
        repo_id,
        ANY_VALUE(repo_name) AS repo_name,
        COUNT(DISTINCT number) AS issues
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id IN (41986369, 16563587, 105944401)
        AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
    GROUP BY period, repo_id
), issues_last_period AS (
    SELECT
        repo_id,
        repo_name,
        issues,
        ROW_NUMBER() OVER(ORDER BY issues DESC) AS `rank`
    FROM
        issues_group_by_period sgp
    WHERE
        period = 0

), issues_last_2nd_period AS (
    SELECT
        repo_id,
        repo_name,
        issues,
        ROW_NUMBER() OVER(ORDER BY issues DESC) AS `rank`
    FROM
        issues_group_by_period sgp
    WHERE
        period = 1
)
SELECT
    ilp.repo_id,
    ilp.repo_name,
    -- Issues
    IFNULL(ilp.issues, 0) AS last_period_total,
    IFNULL(ilp.`rank`, 0) AS last_period_rank,
    IFNULL(il2p.issues, 0) AS last_2nd_period_total,
    IFNULL(il2p.`rank`, 0) AS last_2nd_period_rank,
    IFNULL(((ilp.issues - il2p.issues) / il2p.issues) * 100, 0) AS total_pop,
    IFNULL((ilp.`rank` - il2p.`rank`), 0) AS rank_pop,
    IFNULL(igr.issues, 0) AS total
FROM issues_group_by_repo igr
JOIN issues_last_period ilp ON igr.repo_id = ilp.repo_id
LEFT JOIN issues_last_2nd_period il2p ON igr.repo_id = il2p.repo_id
ORDER BY last_period_rank;
