SELECT actor_login,
       COUNT(*) AS events
FROM github_events ge
WHERE repo_id = 41986369
  AND (
        (type = 'PullRequestEvent' AND action = 'opened') OR
        (type = 'IssuesEvent' AND action = 'opened') OR
        (type = 'IssueCommentEvent' AND action = 'created') OR
        (type = 'PullRequestReviewEvent' AND action = 'created') OR
        (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
        (type = 'PushEvent' AND action = '')
    )
  AND actor_login NOT LIKE '%bot'
  AND actor_login NOT LIKE '%[bot]'
  AND actor_login NOT IN (SELECT login FROM blacklist_users bu)
GROUP BY actor_login
ORDER BY events DESC
LIMIT 9999999999
