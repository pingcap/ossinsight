SELECT
    TRIM(LOWER(REPLACE(gu.organization, '@', ''))) AS company,
    COUNT(DISTINCT actor_id)                 AS users_count
FROM github_events ge
JOIN db_repos db ON db.id = ge.repo_id
JOIN github_users gu ON gu.login = ge.actor_login
WHERE
  event_year = 2021
  AND ge.type IN (
      'IssuesEvent',
      'PullRequestEvent',
      'IssueCommentEvent',
      'PullRequestReviewCommentEvent',
      'CommitCommentEvent',
      'PullRequestReviewEvent'
    )
  AND gu.organization IS NOT NULL  -- TODO: remove
  AND gu.organization != ''
  AND gu.organization != 'none'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20