WITH user_pushes AS (
    SELECT event_month, COUNT(*) AS pushes
    FROM github_events ge
    WHERE type = 'PushEvent' AND actor_id = 5086433
    GROUP BY event_month
    ORDER BY event_month
), user_commits AS (
    SELECT event_month, SUM(push_distinct_size) AS commits
    FROM github_events ge
    WHERE type = 'PushEvent' AND actor_id = 5086433
    GROUP BY event_month
    ORDER BY event_month
)
SELECT up.event_month, up.pushes, uc.commits
FROM user_pushes up
JOIN user_commits uc ON up.event_month = uc.event_month