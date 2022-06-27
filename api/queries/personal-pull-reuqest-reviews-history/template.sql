WITH reviews AS (
    SELECT event_month, COUNT(*) AS cnt
    FROM github_events ge
    WHERE type = 'PullRequestReviewEvent' AND action = 'created' AND actor_id = 5086433
    GROUP BY event_month
    ORDER BY event_month
), review_comments AS (
    SELECT event_month, COUNT(*) AS cnt
    FROM github_events ge
    WHERE type = 'PullRequestReviewCommentEvent' AND action = 'created' AND actor_id = 5086433
    GROUP BY event_month
    ORDER BY event_month
)
SELECT r.event_month, r.cnt AS reviews, rc.cnt AS review_comments
FROM reviews r
JOIN review_comments rc ON r.event_month = rc.event_month