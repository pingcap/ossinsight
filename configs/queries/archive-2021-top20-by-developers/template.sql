SELECT
    actor_login,
    COUNT(*) AS pr_count
FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
WHERE event_year = 2021
  AND type = 'PullRequestEvent'
  AND action = 'opened'
  AND actor_login NOT LIKE '%bot%'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20
;