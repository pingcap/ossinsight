USE gharchive_dev;

with repo AS (
    SELECT repo_id
    FROM github_repos
    WHERE repo_name = CONCAT(${owner}, '/', ${repo})
    LIMIT 1
), pr_with_merged_at AS (
    SELECT
        number, DATE_FORMAT(created_at, '%Y-%m-01') AS t_month, created_at AS merged_at
    FROM
        github_events ge
    WHERE
        type = 'PullRequestEvent'
        -- Considering that some repositories accept the code of the contributor by closing the PR and push commit directly,
        -- here is not distinguished whether it is the merged event.
        -- See: https://github.com/mongodb/mongo/pulls?q=is%3Apr+is%3Aclosed
        AND action = 'closed'
        AND repo_id = (SELECT repo_id FROM repo)
        AND created_at >= ${from}
        AND created_at <= ${to}
), pr_with_opened_at AS (
    SELECT
        number, created_at AS opened_at
    FROM
        github_events ge
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id = (SELECT repo_id FROM repo)
        AND created_at >= ${from}
        AND created_at <= ${to}
         -- Exclude Bots
        AND
            CASE
              WHEN ${exclude_bots} THEN (
                  actor_login NOT LIKE '%bot%' AND
                  actor_login NOT IN (SELECT login FROM blacklist_users bu)
              )
              ELSE TRUE
            END
), tdiff AS (
    SELECT
        t_month,
        (UNIX_TIMESTAMP(pwm.merged_at) - UNIX_TIMESTAMP(pwo.opened_at)) AS diff
    FROM
        pr_with_opened_at pwo
        JOIN pr_with_merged_at pwm ON pwo.number = pwm.number AND pwm.merged_at > pwo.opened_at
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
    ROUND(p0, 2) AS p0,
    ROUND(p25, 2) AS p25,
    ROUND(p50, 2) AS p50,
    ROUND(p75, 2) AS p75,
    ROUND(p100, 2) AS p100
FROM tdiff_with_rank tr
LEFT JOIN tdiff_p25 p25 ON tr.t_month = p25.t_month
LEFT JOIN tdiff_p50 p50 ON tr.t_month = p50.t_month
LEFT JOIN tdiff_p75 p75 ON tr.t_month = p75.t_month
WHERE r = 1
ORDER BY event_month
;