SELECT
    DAYOFWEEK(created_at) - 1 AS dayofweek,
    HOUR(created_at) AS hour,
    COUNT(*) AS cnt,
    type
FROM github_events ge
WHERE
    actor_id = 5086433
    AND type IN ('PushEvent', 'PullRequestEvent', 'PullRequestReviewEvent', 'PullRequestReviewCommentEvent', 'IssuesEvent', 'IssueCommentEvent')
GROUP BY dayofweek, hour, type
ORDER BY dayofweek, hour, type
;