WITH prs AS (
    SELECT
        actor_login, COUNT(*) AS events
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestEvent'
        AND action = 'opened'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
), issues AS (
    SELECT
        actor_login, COUNT(*) AS events
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
        AND action = 'opened'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
), reviews AS (
    SELECT
        actor_login, COUNT(*) AS events
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestReviewEvent'
        AND action = 'created'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
), pushes AS (
    SELECT
        actor_login, COUNT(*) AS events
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PushEvent'
        AND action = ''
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY) AND (event_month BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '%Y-%m-01') AND DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'))
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
)
SELECT actor_login, events
FROM (
    SELECT * FROM prs
    UNION
    SELECT * FROM issues
    UNION
    SELECT * FROM reviews
    UNION
    SELECT * FROM pushes
)
GROUP BY actor_login
ORDER BY events DESC
LIMIT 5
