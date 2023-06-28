WITH prs AS (
    SELECT
        actor_login, COUNT(*) AS events
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestEvent'
        AND action = 'opened'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
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
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
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
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
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
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
        AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
    GROUP BY actor_login
)
SELECT actor_login, SUM(sub.events) AS events
FROM (
    SELECT * FROM prs
    UNION
    SELECT * FROM issues
    UNION
    SELECT * FROM reviews
    UNION
    SELECT * FROM pushes
) sub
GROUP BY actor_login
ORDER BY SUM(sub.events) DESC
LIMIT 5
