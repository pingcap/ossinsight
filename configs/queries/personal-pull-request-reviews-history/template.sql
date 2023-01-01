WITH reviews AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE
        type = 'PullRequestReviewEvent'
        AND action = 'created'
        AND actor_id = 5086433
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
    GROUP BY 1
    ORDER BY 1
), review_comments AS (
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') AS event_month,
        COUNT(*) AS cnt
    FROM github_events ge
    WHERE
        type = 'PullRequestReviewCommentEvent'
        AND action = 'created'
        AND actor_id = 5086433
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
    GROUP BY 1
    ORDER BY 1
)
SELECT
    r.event_month,
    IFNULL(r.cnt, 0) AS reviews,
    IFNULL(rc.cnt, 0) AS review_comments
FROM reviews r
JOIN review_comments rc ON r.event_month = rc.event_month