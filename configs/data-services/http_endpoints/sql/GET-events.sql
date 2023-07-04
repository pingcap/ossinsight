SELECT *
FROM github_events ge
WHERE
  repo_id = 41986369
ORDER BY created_at
LIMIT 10
