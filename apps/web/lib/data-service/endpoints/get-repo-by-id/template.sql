SELECT
    repo_id AS id, repo_name AS fullName
FROM github_repos
WHERE
    repo_id = 41986369
LIMIT 1;