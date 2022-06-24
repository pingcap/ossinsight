WITH issues AS (
    SELECT
        event_month,
        pr_or_issue_id,
        FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
        ROW_NUMBER() OVER(PARTITION BY pr_or_issue_id) AS row_num
    FROM github_events
    USE INDEX(index_github_events_on_repo_id)
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
), issues_current_month AS (
    SELECT
        event_month,
        repo_name,
        total,
        ROW_NUMBER() OVER(PARTITION BY event_month ORDER BY total DESC) AS `rank`
    FROM issues_group_by_month sgn
    WHERE event_month = DATE_FORMAT(date_sub(now(), interval DAYOFMONTH(now()) day), '%Y-%m-01')
), issues_last_month AS (
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
    icm.total AS current_month_total,
    icm.`rank` AS current_month_rank,
    ilm.total AS last_month_total,
    ilm.`rank` AS last_month_rank,
    ((icm.total - ilm.total) / ilm.total) * 100 AS total_mom,
    (icm.`rank` - ilm.`rank`) AS rank_mom,
    igr.total AS total
FROM issues_group_by_repo igr
JOIN issues_current_month icm ON igr.repo_name = icm.repo_name
JOIN issues_last_month ilm ON icm.repo_name = ilm.repo_name
ORDER BY current_month_rank;
