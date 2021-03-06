SELECT
    country_code,
    COUNT(DISTINCT actor_id) AS users_count
FROM github_events
JOIN db_repos db ON db.id = github_events.repo_id
JOIN users u ON u.login = github_events.actor_login
WHERE
  event_year = 2021
  AND github_events.type IN (
      'IssuesEvent',
      'PullRequestEvent',
      'IssueCommentEvent',
      'PullRequestReviewCommentEvent',
      'CommitCommentEvent',
      'PullRequestReviewEvent'
    )
  AND country_code IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10
