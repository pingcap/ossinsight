USE gharchive_dev;
SELECT repo_id, repo_name, stars, forks, created_at
FROM github_repos
WHERE owner_login = ${org_name}
ORDER BY CAST((CASE
  WHEN ${sort} = 'repo_name-asc' THEN repo_name
  WHEN ${sort} = 'stars-desc' THEN -stars
  WHEN ${sort} = 'forks-desc' THEN -forks
  ELSE IF(created_at = 0, '2099-12-31', created_at)
END) AS SIGNED);