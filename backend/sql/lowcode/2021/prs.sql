  SELECT
         wf.name AS repo_name,
         COUNT(*) AS num
    FROM github_events 
         JOIN nocode_repos wf ON wf.id = github_events.repo_id
   WHERE type = 'PullRequestEvent' AND event_year = 2021 AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
