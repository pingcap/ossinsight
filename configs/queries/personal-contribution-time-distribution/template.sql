WITH contributions_group_by_type AS (
    SELECT
        DAYOFWEEK(created_at) - 1 AS dayofweek,
        HOUR(created_at) AS hour,
        COUNT(*) AS cnt,
        CASE type
            WHEN 'IssuesEvent' THEN 'issues'
            WHEN 'IssueCommentEvent' THEN 'issue_comments'
            WHEN 'PullRequestEvent' THEN 'pull_requests'
            WHEN 'PullRequestReviewEvent' THEN 'reviews'
            WHEN 'PullRequestReviewCommentEvent' THEN 'review_comments'
            WHEN 'PushEvent' THEN 'pushes'
        END AS type
    FROM github_events ge
    WHERE
        actor_id = 5086433
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'IssueCommentEvent' AND action = 'created') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action = '')
        )
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
    GROUP BY dayofweek, hour, type
    ORDER BY dayofweek, hour, type
), contributions_group_by_all AS (
    SELECT dayofweek, hour, SUM(cgt.cnt) AS cnt, 'all' AS type
    FROM contributions_group_by_type cgt
    GROUP BY dayofweek, hour
    ORDER BY dayofweek, hour
)
SELECT *
FROM contributions_group_by_all
UNION
SELECT *
FROM contributions_group_by_type
;