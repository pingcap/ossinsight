WITH issue_with_first_responded_at AS (
    SELECT
        number, MIN(DATE_FORMAT(created_at, '%Y-%m-01')) AS t_month, MIN(created_at) AS first_responded_at
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND ((type = 'IssueCommentEvent' AND action = 'created') OR (type = 'IssuesEvent' AND action = 'closed'))
        -- Exclude Bots
        -- AND actor_login NOT LIKE '%bot%'
        -- AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY 1
), issue_with_opened_at AS (
    SELECT
        number, created_at AS opened_at
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
        AND action = 'opened'
        -- Exclude Bots
        -- AND actor_login NOT LIKE '%bot%'
        -- AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
), tdiff AS (
    SELECT
        t_month,
        (UNIX_TIMESTAMP(iwfr.first_responded_at) - UNIX_TIMESTAMP(iwo.opened_at)) AS diff
    FROM
        issue_with_opened_at iwo
        JOIN issue_with_first_responded_at iwfr ON iwo.number = iwfr.number AND iwfr.first_responded_at > iwo.opened_at
), tdiff_with_rank AS (
    SELECT
        tdiff.t_month,
        diff  / 60 / 60 AS diff,
        ROW_NUMBER() OVER (PARTITION BY tdiff.t_month ORDER BY diff) AS r,
        COUNT(*) OVER (PARTITION BY tdiff.t_month) AS cnt,
        FIRST_VALUE(diff / 60 / 60) OVER (PARTITION BY tdiff.t_month ORDER BY diff) AS p0,
        FIRST_VALUE(diff / 60 / 60)  OVER (PARTITION BY tdiff.t_month ORDER BY diff DESC) AS p100
    FROM tdiff
), tdiff_p25 AS (
    SELECT
        t_month, diff AS p25
    FROM
        tdiff_with_rank tr
    WHERE
        r = ROUND(cnt * 0.25)
), tdiff_p50 AS (
    SELECT
        t_month, diff AS p50
    FROM
        tdiff_with_rank tr
    WHERE
        r = ROUND(cnt * 0.5)
), tdiff_p75 AS (
    SELECT
        t_month, diff AS p75
    FROM
        tdiff_with_rank tr
    WHERE
        r = ROUND(cnt * 0.75)
)
SELECT
    tr.t_month AS event_month,
    p0,
    p25,
    p50,
    p75,
    p100
FROM tdiff_with_rank tr
LEFT JOIN tdiff_p25 p25 ON tr.t_month = p25.t_month
LEFT JOIN tdiff_p50 p50 ON tr.t_month = p50.t_month
LEFT JOIN tdiff_p75 p75 ON tr.t_month = p75.t_month
WHERE r = 1
ORDER BY event_month
;