WITH issues AS (
    SELECT
        event_month,
        pr_or_issue_id,
        FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
        ROW_NUMBER() OVER(PARTITION BY pr_or_issue_id) AS row_num
    FROM github_events
    WHERE
        type = 'IssuesEvent'
        AND action = 'opened'
        AND repo_id IN (41986369, 16563587, 105944401)
), issues_group_by_month AS (
    SELECT
        event_month,
        repo_name,
        count(*) AS total
    FROM issues
    WHERE row_num = 1
    GROUP BY event_month, repo_name
    ORDER BY repo_name, event_month
), issues_group_by_repo AS (
    SELECT
        repo_name,
        count(*) AS total
    FROM issues
    WHERE row_num = 1
    GROUP BY repo_name
    ORDER BY repo_name
), issues_last_month AS (
    SELECT
        event_month,
        repo_name,
        total,
        ROW_NUMBER() OVER(PARTITION BY event_month ORDER BY total DESC) AS `rank`
    FROM issues_group_by_month sgn
    WHERE event_month = DATE_FORMAT(date_sub(now(), interval DAYOFMONTH(now()) day), '%Y-%m-01')
), issues_last_2nd_month AS (
    SELECT
        event_month,
        repo_name,
        total,
        ROW_NUMBER() OVER(PARTITION BY event_month ORDER BY total DESC) AS `rank`
    FROM issues_group_by_month sgn
    WHERE event_month = DATE_FORMAT(date_sub(date_sub(now(), interval DAYOFMONTH(now()) day), interval 1 month), '%Y-%m-01')
)
SELECT
    igr.repo_name,
    DATE_FORMAT(date_sub(now(), interval DAYOFMONTH(now()) day), '%Y-%m') AS current_month,
    DATE_FORMAT(date_sub(date_sub(now(), interval DAYOFMONTH(now()) day), interval 1 month), '%Y-%m') AS last_month,
    -- Issues
    ilm.total AS current_month_total,
    ilm.`rank` AS current_month_rank,
    IFNULL(il2m.total, 0) AS last_month_total,
    il2m.`rank` AS last_month_rank,
    ((ilm.total - il2m.total) / il2m.total) * 100 AS total_mom,
    (ilm.`rank` - il2m.`rank`) AS rank_mom,
    igr.total AS total
FROM issues_group_by_repo igr
JOIN issues_last_month ilm ON igr.repo_name = ilm.repo_name
LEFT JOIN issues_last_2nd_month il2m ON ilm.repo_name = il2m.repo_name
ORDER BY current_month_rank;
