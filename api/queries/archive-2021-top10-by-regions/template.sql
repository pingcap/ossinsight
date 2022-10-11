SELECT
    country_code,
    COUNT(DISTINCT actor_id) AS users_count
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
  AND country_code IS NOT NULL -- TODO: remove
  AND gu.country_code != ''
  AND country_code != 'N/A'
  AND country_code != 'UND'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10
