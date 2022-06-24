WITH prs AS (
    SELECT
        event_month,
        pr_or_issue_id,
        FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
        ROW_NUMBER() OVER(PARTITION BY pr_or_issue_id) AS row_num
    FROM github_events
    USE INDEX(index_github_events_on_repo_id)
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id IN (41986369, 16563587, 105944401)
), prs_group_by_month AS (
    SELECT
        event_month,
        repo_name,
        count(*) AS total
    FROM prs
    WHERE row_num = 1
    GROUP BY event_month, repo_name
    ORDER BY repo_name, event_month
), prs_group_by_repo AS (
    SELECT
        repo_name,
        count(*) AS total
    FROM prs
    WHERE row_num = 1
    GROUP BY repo_name
    ORDER BY repo_name
), prs_current_month AS (
    SELECT
        event_month,
        repo_name,
        total,
        ROW_NUMBER() OVER(PARTITION BY event_month ORDER BY total DESC) AS `rank`
    FROM prs_group_by_month sgn
    WHERE event_month = DATE_FORMAT(date_sub(now(), interval DAYOFMONTH(now()) day), '%Y-%m-01')
), prs_last_month AS (
    SELECT
        event_month,
        repo_name,
        total,
        ROW_NUMBER() OVER(PARTITION BY event_month ORDER BY total DESC) AS `rank`
    FROM prs_group_by_month sgn
    WHERE event_month = DATE_FORMAT(date_sub(date_sub(now(), interval DAYOFMONTH(now()) day), interval 1 month), '%Y-%m-01')
)
SELECT
    pgr.repo_name,
    DATE_FORMAT(date_sub(now(), interval DAYOFMONTH(now()) day), '%Y-%m') AS current_month,
    DATE_FORMAT(date_sub(date_sub(now(), interval DAYOFMONTH(now()) day), interval 1 month), '%Y-%m') AS last_month,
    -- PRs
    pcm.total AS current_month_total,
    pcm.`rank` AS current_month_rank,
    plm.total AS last_month_total,
    plm.`rank` AS last_month_rank,
    ((pcm.total - plm.total) / plm.total) * 100 AS total_mom,
    (pcm.`rank` - plm.`rank`) AS rank_mom,
    pgr.total AS total
FROM prs_group_by_repo pgr
JOIN prs_current_month pcm ON pgr.repo_name = pcm.repo_name
JOIN prs_last_month plm ON pcm.repo_name = plm.repo_name
ORDER BY current_month_rank;