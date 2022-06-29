WITH contributions AS (
    SELECT
        id,
        type,
        repo_id,
        FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name
    FROM github_events ge
    WHERE
        actor_id = 5086433
        AND type IN ('PushEvent', 'PullRequestEvent', 'PullRequestReviewEvent', 'PullRequestReviewCommentEvent', 'IssuesEvent', 'IssueCommentEvent')
)
SELECT
    repo_id,
    repo_name,
    type,
    COUNT(DISTINCT id) AS cnt 
FROM contributions c
GROUP BY repo_id, type
ORDER BY repo_id, type 
;