SELECT
  wf.name AS repo_name,
  COUNT(*) AS stars
FROM github_events 
JOIN js_framework_repos wf ON wf.id = github_events.repo_id
WHERE type = 'WatchEvent' AND event_year = 2021
GROUP BY 1
ORDER BY 2 desc
LIMIT 10
