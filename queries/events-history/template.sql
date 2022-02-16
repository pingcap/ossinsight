SELECT
/*+ read_from_storage(tiflash[github_events]) */
    ANY_VALUE(repo_subset.name) AS events,
    COUNT(*)                    AS `count`
FROM github_events_old AS github_events
         JOIN db_repos AS repo_subset
              ON repo_subset.id = github_events.repo_id
WHERE github_events.type = 'WatchEvent'
GROUP BY github_events.repo_id
ORDER BY `count` DESC
LIMIT 10;