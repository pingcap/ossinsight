USE gharchive_dev;
WITH issues_group_by_repo AS (
    SELECT
        repo_id,
        COUNT(DISTINCT number) AS issues
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = ${collection_id})
    GROUP BY repo_id
), issues_group_by_period AS (
    SELECT
        CASE
          WHEN ${period} = 'past_month' THEN TIMESTAMPDIFF(MONTH, DATE(created_at), CURRENT_DATE())
          ELSE DATEDIFF(CURRENT_DATE(), DATE(created_at)) DIV 28
        END AS period,
        repo_id,
        COUNT(DISTINCT number) AS issues
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = ${collection_id})
        AND CASE
          WHEN ${period} = 'past_month' THEN created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH)
          ELSE created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
        END
    GROUP BY period, repo_id
), current_period_issues AS (
    SELECT
        repo_id,
        issues,
        ROW_NUMBER() OVER(ORDER BY issues DESC) AS `rank`
    FROM
        issues_group_by_period igp
    WHERE
        period = 0
), past_period_issues AS (
    SELECT
        repo_id,
        issues,
        ROW_NUMBER() OVER(ORDER BY issues DESC) AS `rank`
    FROM
        issues_group_by_period igp
    WHERE
        period = 1
)
SELECT
    ci.repo_id,
    ci.repo_name,
    -- Issues
    IFNULL(cpi.issues, 0)                                  AS current_period_growth,
    IFNULL(cpi.`rank`, 0)                                  AS current_period_rank,
    IFNULL(ppi.issues, 0)                                  AS past_period_growth,
    IFNULL(ppi.`rank`, 0)                                  AS past_period_rank,
    -- The changes of total issues between two periods.
    IFNULL(ROUND((cpi.issues - ppi.issues) / ppi.issues * 100, 2), 0) AS growth_pop,
    -- The rank changes between two periods.
    IFNULL((cpi.`rank` - ppi.`rank`), 0)                   AS rank_pop,
    -- The total issues of repo.
    IFNULL(igr.issues, 0)                                  AS total
FROM issues_group_by_repo igr
JOIN collection_items ci ON ci.collection_id = ${collection_id} AND igr.repo_id = ci.repo_id
JOIN current_period_issues cpi ON igr.repo_id = cpi.repo_id
LEFT JOIN past_period_issues ppi ON igr.repo_id = ppi.repo_id
ORDER BY current_period_rank;
