SELECT
/*+ read_from_storage(tiflash[github_events]) */
    ANY_VALUE(repo_subset.name) AS repo_name,
    COUNT(DISTINCT github_events.actor_id) AS events_count
FROM github_events_old AS github_events
         JOIN db_repos AS repo_subset
              ON repo_subset.id = github_events.repo_id
WHERE github_events.type = 'PullRequestEvent'
  AND github_events.action = 'closed'
  AND github_events.pr_merged IS TRUE
  AND github_events.event_year >= YEAR(DATE_SUB(NOW(), INTERVAL 7 YEAR))
GROUP BY github_events.repo_id
ORDER BY events_count DESC
LIMIT 10;