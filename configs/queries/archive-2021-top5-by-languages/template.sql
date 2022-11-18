SELECT
    language,
    COUNT(*)
FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
WHERE event_year = 2021
  AND type = 'PullRequestEvent'
  AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 5