WITH pr_with_author AS (
    SELECT pr_or_issue_id, ANY_VALUE(actor_id) AS actor_id, ANY_VALUE(actor_login) AS actor_login
    FROM github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestEvent' AND action = 'opened'
    GROUP BY pr_or_issue_id
), code_change_contribution_last_month AS (
    SELECT
        pwa.actor_id,
        ANY_VALUE(pwa.actor_login) AS actor_login, 
        SUM(additions) AS `add`,
        SUM(deletions) AS `delete`,
        SUM(additions + deletions) AS `lines`
    FROM github_events ge
    JOIN pr_with_author pwa ON ge.pr_or_issue_id = pwa.pr_or_issue_id
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestEvent' AND pr_merged = true
        AND event_month = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), '%Y-%m-01')
        AND pwa.actor_login NOT LIKE '%bot' AND pwa.actor_login NOT LIKE '%[bot]' AND pwa.actor_login NOT IN (SELECT login FROM blacklist_users)
    GROUP BY pwa.actor_id
), code_change_contribution_last_2nd_month AS (
    SELECT
        pwa.actor_id,
        ANY_VALUE(pwa.actor_login) AS actor_login,
        SUM(additions) AS `add`,
        SUM(deletions) AS `delete`,
        SUM(additions + deletions) AS `lines`
    FROM github_events ge
    JOIN pr_with_author pwa ON ge.pr_or_issue_id = pwa.pr_or_issue_id
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestEvent' AND pr_merged = true
        AND event_month = DATE_FORMAT(DATE_SUB(DATE_SUB(NOW(), INTERVAL DAYOFMONTH(NOW()) DAY), INTERVAL 1 MONTH), '%Y-%m-01')
        AND pwa.actor_login NOT LIKE '%bot' AND pwa.actor_login NOT LIKE '%[bot]' AND pwa.actor_login NOT IN (SELECT login FROM blacklist_users)
    GROUP BY pwa.actor_id
)
SELECT
    lm.actor_id,
    lm.actor_login,
    -- lines
    ROW_NUMBER() OVER (ORDER BY lm.`lines` DESC) AS lines_row_num,
    lm.`lines` AS last_month_lines,
    COALESCE(l2m.`lines`, 0) AS last_2nd_month_lines,
    COALESCE(lm.`lines` - l2m.`lines`, 0) AS lines_changes, 
    lm.`lines` / (SELECT COALESCE(SUM(`lines`), 0) FROM code_change_contribution_last_month) AS lines_proportion,
    -- add
    ROW_NUMBER() OVER (ORDER BY lm.`add` DESC) AS add_row_num,
    lm.`add` AS last_month_add,
    COALESCE(l2m.`add`, 0) AS last_2nd_month_add,
    COALESCE(lm.`add` - l2m.`add`, 0) AS add_changes, 
    lm.`add` / (SELECT COALESCE(SUM(`add`), 0) FROM code_change_contribution_last_month) AS add_proportion,
    -- delete
    ROW_NUMBER() OVER (ORDER BY lm.`delete` DESC) AS delete_row_num,
    lm.`delete` AS last_month_delete,
    COALESCE(l2m.`delete`, 0) AS last_2nd_month_delete,
    COALESCE(lm.`delete` - l2m.`delete`, 0) AS delete_changes, 
    lm.`delete` / (SELECT COALESCE(SUM(`delete`), 0) FROM code_change_contribution_last_month) AS delete_proportion
FROM code_change_contribution_last_month lm
LEFT JOIN code_change_contribution_last_2nd_month l2m ON lm.actor_id = l2m.actor_id
ORDER BY lm.lines DESC
LIMIT 50
;