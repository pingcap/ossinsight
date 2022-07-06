SELECT
    repo_id, ANY_VALUE(repo_name) AS repo_name, COUNT(DISTINCT id) AS cnt
FROM
    github_events ge
WHERE
    event_year = 2021
    AND type IN ('IssuesEvent', 'IssueCommentEvent', 'PullRequestEvent', 'PullRequestReviewEvent', 'PullRequestReviewCommentEvent', 'CommitCommentEvent', 'CreateEvent', 'DeleteEvent', 'PushEvent')
    AND actor_login IN ('Mini256')
GROUP BY repo_id
ORDER BY cnt DESC